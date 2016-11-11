class Admin::UserReservationsController < ApplicationController
  before_action :admins_only

  # GET      /admin/user_reservations/:id(.:format)
  def show
    user_reservation = UserReservation.find(params[:id])

    if user_reservation.golf_club.user == current_user then
      render json: { :user_reservation => user_reservation.attributes.merge({total_price:user_reservation.total_price,
        ur_member_details:user_reservation.ur_member_details.to_a}) }
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

    flight_info = params[:flight_info]
    #check the members list to ensure that they are sane
    if flight_info["members"].inject(false){|p,v| p || (v["name"].empty? || v["id"].empty?)} then
      render json: {message:'Failed to create a reservation'}, status: :unprocessable_entity
      return
    end

    UserReservation.transaction do
      #create the reservation
      ur = UserReservation.create_reservation params[:flight_matrix_id], current_user.id, params[:booking_date], params[:flight_info]
      flight_info["members"].each do | member |
        ur_member_details = UrMemberDetails.create({name:member["name"], member_id:member["id"], user_reservation_id:ur.id})
      end
    end

    if ur.valid? then
      ur.payment_attempted!
      render json: {message:"Reservation #{ur.id} created"}, status: :ok
    else
      render json: {message:'Failed to create a reservation'}, status: :unprocessable_entity
    end
  end

  # DELETE   /admin/user_reservations/:id(.:format)
  def destroy
    ur = UserReservation.find(params[:id])
    ur.canceled_by_club!

    render json: {message:"Reservation #{ur.id} canceld by #{current_user.name}" }
  end

  # PUT/PATCH    /admin/golf_clubs/:id(.:format)
  # required params :flight_info => {:pax, :buggy, :caddy, :insurance }
  def update
    #update the schedule and recalculate the pricing

    flight_info = params[:flight_info]
    ur = UserReservation.find(params[:id])
    ur.transaction do
      ur.update_attributes({ count_pax:flight_info[:pax], count_buggy:flight_info[:buggy],
        count_caddy:flight_info[:caddy], count_insurance:flight_info[:insurance]})
      ur.update_pricing
    end
    render json: {message:"Update Pricing for #{ur.id}"}
  end

  # POST     /admin/user_reservations/:user_reservation_id/confirm
  def confirm
    ur = UserReservation.find(params[:user_reservation_id])
    ur.transaction do
      ur.reservation_confirmed!
    end
    render json: {message:"Reservation #{ur.id} confirmed"}
  end
end
