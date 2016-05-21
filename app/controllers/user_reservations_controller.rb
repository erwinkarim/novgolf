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
    session[:teeTimes].each do |teetime|

      tee_time = teetime.split(",")[0]
      matrix_id = teetime.split(",")[1]
      reservation = current_user.user_reservations.new( :golf_club_id => params[:golf_club_id], :booking_date => Date.today,
        :booking_time => teetime, :actual_buggy => session[:price][:cart], :actual_caddy => session[:price][:caddy],
        :actual_pax => session[:price][:pax], :flight_matrix_id => matrix_id )
      reservation.save!
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
      reservations = UserReservation.find(session[:reservation_ids])
      reservations.each do |reservation|
        reservation.payment_confirmed!
        #generate the token

      end
    else
      reservations.each do |reservation|
        reservation.payment_failed!
      end
    end
  end

  # GET      /users/:user_id/reservations(.:format)
  def user_index
    #ensure that you are authorized to see this
    if current_user.id == params[:user_id].to_i then
      @reservations = current_user.user_reservations.order(:booking_date => :desc, :booking_time => :desc)
    else
      render :file => "public/500.html", :status => :unauthorized
    end
  end
end
