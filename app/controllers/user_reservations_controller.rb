# TODO: handle fuzzy bookings
class UserReservationsController < ApplicationController
  before_action :authenticate_user!, except: [:public_view]

  def handle_bad_request
    render file: "public/400.html", status: :bad_request
    return
  end

  # POST/GET     /golf_clubs/:golf_club_id/user_reservations/reserve(.:format)
  # TODO: setup flight_matrix_id for fuzzy selection reservation
  def reserve
    @club = GolfClub.find(params[:golf_club_id])
    #@courses = @club.course_listings

    check_passed = true

    #sanity checks to ensure all info is there
    if !params.has_key?(:info) then
      check_passed = false
    else
      #params[:info].keys tax and total price are derived values
      if !params[:info].has_key?(:total_price) then
        check_passed = false
      end
    end

    if !params.has_key?(:flight) then
      check_passed = false
    else
      #check each of the flight details
      params[:flight].each_pair do |k,v|
        if !v.has_key?(:tee_time) then
          check_passed = false
        end

        #check the flight_matrix_id
        if !v.has_key?(:matrix_id) then
          # if the club is using fuzzy selection method, autofill first flight_matrix_id
          if @club.flight_select_fuzzy? then
            v[:matrix_id] = @club.flight_matrices.first.id
          else
            check_passed = false
          end
        end

        # if the club course selection method is user_auto_select then
        # skip check for keys
        if @club.course_global_setting.user_selection != "user_auto_select" then
          if !v.has_key?(:courses) then
            check_passed = false
          else
            #check the first and second course name
            if !v[:courses].has_key?(:first_course) || !v[:courses].has_key?(:second_course) then
              check_passed = false
            end
          end
          #set the course
          @first_course = @club.course_listings.where(:id => v[:courses][:first_course]).first.name
          @second_course = @club.course_listings.where(:id => v[:courses][:second_course]).first.name
        else
          #auto select the course
          @first_course = "system_selected"
          @second_course = "system_selected"
        end

        if !v.has_key?(:count) then
          check_passed = false
        else
          if !v[:count].has_key?(:pax) || !v[:count].has_key?(:caddy) || !v[:count].has_key?(:buggy) || !v[:count].has_key?(:insurance) then
            check_passed = false
          end
        end

        if !v.has_key?(:price) then
          check_passed = false
        else
          if !v[:price].has_key?(:pax) || !v[:price].has_key?(:caddy) || !v[:price].has_key?(:buggy) || !v[:price].has_key?(:insurance) then
            check_passed = false
          end
        end
      end
    end #params[:flight] check

    if !check_passed then
      render file: "public/400.html", status: :bad_request
    end

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
  # process the payment
  def processing
    #set that you need to complete this transaction (get reservation confirmation token) within 10 minutes
    @club = GolfClub.find(params[:golf_club_id])
    club_id = @club.id
    session[:reservation_ids] = []
    session[:timeout] = Time.now + 10.minutes

    #Rails.logger.info "session[:flight] is #{session[:flight]}"
    #create a reservation w/o token to show that this flight is being reserved
    # TODO: course selection can be auto or manual
    UserReservation.transaction do
      session[:flight].each_pair do |k,v|
        course_selection_options = @club.course_global_setting.user_selection == "user_auto_select" ?
          {} :
          { course_selection:UserReservation.course_selection_methods[:manual],
            course_selection_ids:[ v["courses"]["first_course"], v["courses"]["second_course"] ] }

        Rails.logger.info "
          ur = UserReservation.create_reservation #{v["matrix_id"]}, #{current_user.id}, #{Date.parse(session[:info]["date"])}, #{v["count"]},
          #{course_selection_options.inspect}
        "

        reservation_options = v["count"].merge({preferred_time:v["preferred_time"]})
        ur = UserReservation.create_reservation v["matrix_id"], current_user.id, Date.parse(session[:info]["date"]), reservation_options,
          course_selection_options

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
          Rails.logger.error ur.errors.messages.join(',')
          ur.reservation_failed!
        end
      end
    end

    #update the total price to be charged before sending it out to online payment gateway
    session[:info]["grand_total"] = UserReservation.where(id: session[:reservation_ids]).inject(0){|p,v| p += v.total_price }

    #check payment status in 11 minutes
    CheckPaymentStatusJob.set(wait: 11.minutes).perform_later(UserReservation.find(session[:reservation_ids]))
=begin
  rescue
    flash[:error] = "Failure in booking"

    #TODO: better to redirect back to root search page w/ stored search parameters
    # redirect_to root_path
=end
  end

  # POST     /golf_clubs/:golf_club_id/user_reservations/confirmation(.:format)
  def confirmation
    #get some grace period for shit happens
    grace = Time.parse(session[:timeout]) + 5.minutes
    club = GolfClub.find(params[:golf_club_id])

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
            #check if this club is fuzzy or exact
            if club.flight_select_exact? then
              reservation.payment_confirmed!
            else
              reservation.reservation_await_assignment!
            end
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

      #send out email to confirm or tell the user flights are being confirmed later
      if club.flight_select_exact?
        UserMailer.reservation_confirmed(@reservations).deliver_later
      else
        UserMailer.reservation_await_assignment(@reservations).deliver_later
      end

    else
      @reservations.each do |reservation|
        reservation.payment_failed!
      end
    end
  end

  # GET      /users/:user_id/reservations(.:format)
  def user_index
    #ensure that you are authorized to see this
    if current_user.id != params[:user_id].to_i then
      render :file => "public/500.html", :status => :unauthorized
      return
    end

    @reservations = current_user.user_reservations.includes(:golf_club).order(:booking_date => :desc, :booking_time => :desc).limit(40)

    #cutoff time between past and future is yesterday
    cutoffDate = 1.day.ago
    @futureFlights = @reservations.select{ |x| x.booking_date > cutoffDate }
    @pastFlights = @reservations.select{ |x| x.booking_date < cutoffDate }
  end

  #  GET      /users/:user_id/reservations/:id(.:format)
  def show
    @user = User.find(params[:user_id])
    @reservation = UserReservation.includes(:review).find(params[:id])
    @club = @reservation.golf_club

    #you can only see it if you own the reservation or the club
    allowed_to_see = @reservation.user_id == current_user.id || @reservation.golf_club.user.id == current_user.id
    if !allowed_to_see then
      render file: "public/401.html", status: :unauthorized
      return
    end

    @review = @reservation.review.nil? ? nil : @reservation.review.to_json
    @note = @reservation.charge_schedule.nil? ? nil : @reservation.charge_schedule.note

    #only show review form if it's 12 hours after tee time and date
    flight_is_12hours_old= DateTime.parse("#{@reservation.booking_date} #{@reservation.booking_time.to_datetime.strftime('%H:%M')} +0000") <
      DateTime.now + 12.hours
    @allow_to_review = @reservation.payment_confirmed? || @reservation.reservation_confirmed?
    @show_review_form = flight_is_12hours_old &&
      (@reservation.payment_confirmed? || @reservation.reservation_confirmed?) &&
      @reservation.review.nil?

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

  # GET      /reservations/:reservation_id(.:format)
  # allow to publicly view the reservation w/ special token
  def public_view
    if !params.has_key?(:t) then
      Rails.logger.error "No token to view reservation"
      render file: "public/401.html", status: :unauthorized
      return
    end

    @reservation = UserReservation.find(params[:reservation_id])
    @club = @reservation.golf_club

    if @reservation.token != params[:t] then
      Rails.logger.error "Incorrect token to view reservation"
      render file:"public/401.html", status: :unauthorized
      return
    end

    respond_to do |format|
      format.html
    end
  end

  #accept a proposal by the operator
  #reservation status must be operator_new_proposal and one of the params must have
  # the token
  # GET      /reservations/:reservation_id/accept_proposal(.:format
  def accept_proposal
    # ensure token is there
    if !params.has_key?(:t) then
      Rails.logger.error "No token to view reservation"
      render file: "public/401.html", status: :unauthorized
      return
    end

    @reservation = UserReservation.find(params[:reservation_id])
    #ensure that the status is operator_new_proposal
    if !@reservation.operator_new_proposal? then
      Rails.logger.error "No token to view reservation"
      render file: "public/401.html", status: :unauthorized
      return
    end


    #up the the status and send out notice about this
    # include case history about the user doing this
    @reservation.transaction do
      @reservation.reservation_confirmed!
      ur_case_history = @reservation.ur_turk_case.ur_turk_case_history.new({
        action:UrTurkCaseHistory.actions[:user_accept_proposal],
        action_by: current_user.id
        })
      ur_case_history.save!
    end
    UserReservationMailer.user_accept_proposal(@reservation).deliver_later
  end

  #reject a proposal by the operator
  #reservation status must be operator_new_proposal and one of the params must have
  # the token
  def reject_proposal
    if !params.has_key?(:t) then
      Rails.logger.error "No token to view reservation"
      render file: "public/401.html", status: :unauthorized
      return
    end

    #ensure that the current status is operator offering new proposal
    if !@reservation.operator_new_proposal? then
      Rails.logger.error "No token to view reservation"
      render file: "public/401.html", status: :unauthorized
      return
    end

    #update the status and send out notice about this
    @reservation = UserReservation.find(params[:reservation_id])
    @reservation.transaction do
      @reservation.canceled_by_user!
      ur_case_history = @reservation.ur_turk_case.ur_turk_case_history.new({
        action:UrTurkCaseHistory.actions[:user_reject_proposal],
        action_by: current_user.id
        })
      ur_case_history.save!
    end

    #refund the reservation

    #send email about it
    UserReservationMailer.user_reject_proposal(@reservation).deliver_later
  end
end
