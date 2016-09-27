class UserReservationsController < ApplicationController
  before_action :authenticate_user!

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


    #Rails.logger.info "the session flight is is #{session[:flight]  }"
  end

  def processing
    #set that you need to complete this transaction (get reservation confirmation token) within 10 minutes
    @club = GolfClub.find(params[:golf_club_id])
    session[:reservation_ids] = []
    session[:timeout] = Time.now + 10.minutes

    #Rails.logger.info "session[:flight] is #{session[:flight]}"
    #create a reservation w/o token to show that this flight is being reserved
    #todo: think about splitting the pricing data into each reservation(s)
    #   eg: if you booked 5 balls in 2 flights, flight a will have 3 balls and flight b will have 2 balls and are priced accordingly
    UserReservation.transaction do
      session[:flight].each_pair do |k,v|
        tax = (v["price"]["pax"].to_f + v["price"]["cart"].to_f + v["price"]["caddy"].to_f + v["price"]["insurance"].to_f) * @club.tax_schedule.rate
        reservation = current_user.user_reservations.new( :golf_club_id => params[:golf_club_id],
          :booking_date => Date.parse(session[:info]["date"]), :booking_time => v["tee_time"],
          :actual_buggy => v["price"]["cart"], :actual_caddy => v["price"]["caddy"],
          :actual_pax => v["price"]["pax"], :actual_insurance => v["price"]["insurance"],
          :count_buggy => v["count"]["buggy"], :count_caddy => v["count"]["caddy"],
          :count_pax => v["count"]["pax"], :count_insurance => v["count"]["insurance"],
          :actual_tax => tax,
          :flight_matrix_id => v["matrix_id"] )

        reservation.regenerate_token
        #reservation.save!

        reservation.reservation_created!
        reservation.payment_attempted!
        session[:reservation_ids] << reservation.id
      end
    end

    #check payment status in 11 minutes
    CheckPaymentStatusJob.set(wait: 11.minutes).perform_later(UserReservation.find(session[:reservation_ids]))
  end

  def confirmation
    #get some grace period for shit happens
    grace = Time.parse(session[:timeout]) + 5.minutes

    #if token got before session timeout. generate token and show out the confirmation page
    if Time.now < grace then
      @reservations = UserReservation.find(session[:reservation_ids])
      @reservations.each do |reservation|
        reservation.payment_confirmed!

        #send out review in the future
        UserReservationMailer.request_review(reservation).deliver_later(wait_until: reservation.booking_datetime + 12.hours)
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
      @reservations = current_user.user_reservations.includes(:golf_club).order(:booking_date => :desc, :booking_time => :desc).limit(30)

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
    @allow_to_review = @reservation.payment_confirmed?
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
