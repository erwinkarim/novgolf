class UserReservationsController < ApplicationController
  before_action :authenticate_user!

  # POST/GET     /golf_clubs/:golf_club_id/user_reservations/reserve(.:format)
  def reserve
    @club = GolfClub.find(params[:golf_club_id])

    #add tax rate into the params
    params[:info][:tax] = params[:info][:total_price].to_f * @club.tax_schedule.rate
    params[:info][:grand_total] = (params[:info][:total_price].to_f * @club.tax_schedule.rate) + params[:info][:total_price].to_f

    #create the session
    session[:flight] = params[:flight]
    session[:info] = params[:info]
    session[:teeTimes] = params[:teeTimes]
    session[:golf_club_id] = params[:golf_club_id]
  end

  # POST /golf_clubs/:golf_club_id/user_reservations/processing
  def processing

    #set that you need to complete this transaction (get reservation confirmation token) within 10 minutes
    @club = GolfClub.find(params[:golf_club_id])
    club_id = @club.id
    session[:reservation_ids] = []
    session[:timeout] = Time.now + 10.minutes

    #Rails.logger.info "session[:flight] is #{session[:flight]}"
    #create a reservation w/o token to show that this flight is being reserved
    UserReservation.transaction do
      session[:flight].each_pair do |k,v|
        ur = UserReservation.create_reservation v["matrix_id"], current_user.id, Date.parse(session[:info]["date"]), v["count"]
        if ur.valid? then
          ur.regenerate_token

          ur.reservation_created!
          ur.payment_attempted!
          session[:reservation_ids] << ur.id

          #generate the appropiate member id/name to be linked with this
          #autofill by system, need to verified by dashboard operator
          if ur.count_member > 0 then
            (1..ur.count_member).each do |member|
              ur_member_detail = UrMemberDetail.new(name:"AutoName", member_id:"AutoID", user_reservation_id:ur.id)
              ur_member_detail.save!
            end
          end

        else
          ur.reservation_failed!
        end
      end
    end

    #update the total price to be charged before sending it out to online payment gateway
    session[:info]["grand_total"] = UserReservation.where(id: session[:reservation_ids]).inject(0){|p,v| p += v.total_price }

    #check payment status in 11 minutes
    CheckPaymentStatusJob.set(wait: 11.minutes).perform_later(UserReservation.find(session[:reservation_ids]))
  rescue
    flash[:error] = "Failure in booking"

    #TODO: better to redirect back to root search page w/ stored search parameters
    redirect_to root_path
  end

  def confirmation
    #get some grace period for shit happens
    grace = Time.parse(session[:timeout]) + 5.minutes

    #if token got before session timeout. generate token and show out the confirmation page
    @reservations = UserReservation.find(session[:reservation_ids])
    if Time.now < grace then
      @reservations.each do |reservation|
        #payment has been made for each reservation
        UserReservation.transaction do
          #payment will always be based on cc
          reservation.record_payment reservation.total_price

          # if got members, need to be verified by the club first, but do send out the email regrading
          # the reservation(s)
          if reservation.count_member > 0 then
            reservation.requires_members_verification!
          else
            reservation.payment_confirmed!
          end

          #destroy the sessions that is not being used anymore
          session.delete(:info)
          session.delete(:flight)
          session.delete(:golf_club_id)
        end

        #send out review in the future
        #wait until i've resolve the issue about shoryuken-later
        #UserReservationMailer.request_review(reservation).deliver_later(wait_until: reservation.booking_datetime + 12.hours)
      end

      #send out email to confirm
      UserMailer.reservation_confirmed(@reservations).deliver_later


    else
      @reservations.each do |reservation|
        reservation.payment_failed!
      end
    end
  end

  # GET      /users/:user_id/reservations(.:format)
  def user_index
    #ensure that you are authorized to see this
    if current_user.id == params[:user_id].to_i then
      @reservations = current_user.user_reservations.includes(:golf_club).order(:booking_date => :desc, :booking_time => :desc).limit(40)

      #cutoff time between past and future is yesterday
      cutoffDate = 1.day.ago
      @futureFlights = @reservations.select{ |x| x.booking_date > cutoffDate }
      @pastFlights = @reservations.select{ |x| x.booking_date < cutoffDate }
    else
      render :file => "public/500.html", :status => :unauthorized
    end
  end

  #  GET      /users/:user_id/reservations/:id(.:format)
  def show
    @user = User.find(params[:user_id])
    @reservation = UserReservation.includes(:review).find(params[:id])
    @review = @reservation.review.nil? ? nil : @reservation.review.to_json

    #only show review form if it's 12 hours after tee time and date
    flight_is_12hours_old= DateTime.parse("#{@reservation.booking_date} #{@reservation.booking_time.to_datetime.strftime('%H:%M')} +0000") <
      DateTime.now + 12.hours
    @allow_to_review = @reservation.payment_confirmed? || @reservation.reservation_confirmed?
    @show_review_form = flight_is_12hours_old && @reservation.payment_confirmed? && @reservation.review.nil?

    respond_to do |format|
      format.html
      format.json {
        render json: @reservation.attributes.merge({user:@user, review:@review})
      }
    end
  end

  # GET      /golf_clubs/:golf_club_id/user_reservations/failure(.:format)
  def failure
    #failed to pay in time, due to time out of something
    @reservations = UserReservation.find(session[:reservation_ids])
    @reservations.each do |reservation|
      reservation.payment_failed!
    end

    render
  end
end
