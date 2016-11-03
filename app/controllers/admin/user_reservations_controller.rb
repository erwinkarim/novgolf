class Admin::UserReservationsController < ApplicationController
  before_action :admins_only

  # GET      /admin/user_reservations/:id(.:format)
  def show
    user_reservation = UserReservation.find(params[:id])

    if user_reservation.golf_club.user == current_user then
      render json: { :user_reservation => user_reservation.attributes.merge({total_price:user_reservation.total_price}) }
    else
      render :file => "public/404", status: :unauthorized
    end
  end

  # POST     /admin/user_reservations(.:format)
  # sample Parameters: {"golf_club_id"=>"2", "booking_date"=>"5/11/2016", "booking_time"=>"08:08",
  #    "flight_matrix_id"=>"73",
  #    "flight_info"=>{"pax"=>"2", "buggy"=>"1", "caddy"=>"1", "insurance"=>"0", "tax"=>"37.8", "totalPrice"=>"667.8"}}
  def create
    #get the charge schedule based on flight_matrix_id
    ur = UserReservation.create_reservation params[:flight_matrix_id], current_user.id, params[:booking_date], params[:flight_info]
    if ur.valid? then
      ur.payment_attempted!
      render json: {message:"Reservation #{ur.id} created"}, status: :ok
    else
      render json: {message:'Failed to create a reservation'}, status: :unprocessable_entity
    end
  end

  # DELETE   /admin/user_reservations/:id(.:format)
  def destroy
    render json: {message:'destoryed'}
  end

  # PUT/PATCH    /admin/golf_clubs/:id(.:format)
  def update
    render json: {message:'updated'}
  end

  # POST     /admin/user_reservations/:user_reservation_id/confirm
  def confirm
    render json: {message:'confirmed'}
  end
end
