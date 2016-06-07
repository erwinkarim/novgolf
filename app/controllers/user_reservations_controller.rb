class UserReservationsController < ApplicationController
  before_action :authenticate_user!

  def reserve
    @club = GolfClub.find(params[:golf_club_id])

    #create the session
    session[:flight] = params[:flight]
    session[:price] = params[:price]
    session[:teeTimes] = params[:teeTimes]
    session[:golf_club_id] = params[:golf_club_id]

    Rails.logger.info "the session flight is is #{session[:flight]  }"
  end

  def processing
    #set that you need to complete this transaction (get reservation confirmation token) within 10 minutes
    session[:reservation_ids] = []
    session[:timeout] = Time.now + 10.minutes

    #create a reservation w/o token to show that this flight is being reserved
    #todo: think about splitting the pricing data into each reservation(s)
    #   eg: if you booked 5 balls in 2 flights, flight a will have 3 balls and flight b will have 2 balls and are priced accordingly
    session[:teeTimes].each do |teetime|

      tee_time = teetime.split(",")[0]
      matrix_id = teetime.split(",")[1]
      reservation = current_user.user_reservations.new( :golf_club_id => params[:golf_club_id], :booking_date => Date.parse(session[:flight]["date"]),
        :booking_time => teetime, :actual_buggy => session[:price]["cart"], :actual_caddy => session[:price]["caddy"],
        :actual_pax => session[:price]["pax"], :flight_matrix_id => matrix_id )
      #generate the token will actually save the record
      reservation.regenerate_token
      #reservation.save!
      session[:reservation_ids] << reservation.id
      reservation.reservation_created!
      reservation.payment_attempted!
    end
  end

  def confirmation
    #get some grace period for shit happens
    grace = Time.parse(session[:timeout]) + 5.minutes

    #if token got before session timeout. generate token and show out the confirmation page
    if Time.now < grace then
      @reservations = UserReservation.find(session[:reservation_ids])
      @reservations.each do |reservation|
        reservation.payment_confirmed!
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
    @reservation = UserReservation.find(params[:id])
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
