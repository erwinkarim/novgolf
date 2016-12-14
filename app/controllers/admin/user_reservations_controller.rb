class Admin::UserReservationsController < ApplicationController
  before_action :admins_only

  # GET      /admin/user_reservations/:id(.:format)
  def show
    user_reservation = UserReservation.find(params[:id])

    if user_reservation.golf_club.user == current_user then
      render json: { :user_reservation => user_reservation.attributes.merge({total_price:user_reservation.total_price,
        ur_member_details:user_reservation.ur_member_details.to_a, status_text:user_reservation.status}) }
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

    #if trying to book something > 24 before today, send out error message
    if Date.parse(params[:booking_date]) < Date.yesterday then
      render json: {message:"Cannot book anything more than 24 hours ago"}
      return
    end

    #check the members list to ensure that they are sane
    if params.has_key?(:flight_info) && flight_info.has_key?(:members) then
      if flight_info["members"].inject(false){|p,v| p || (v[1]["name"].empty? || v[1]["member_id"].empty?)} then
        render json: {message:'Failed to create a reservation'}, status: :unprocessable_entity
        return
      end
    end

    ur = UserReservation.new
    UserReservation.transaction do
      #create the reservation
      ur = UserReservation.create_reservation params[:flight_matrix_id], current_user.id, params[:booking_date], params[:flight_info]
      unless params.has_key?(:flight_info) then
        flight_info["members"].each_pair do |index, member|
          ur_member_details = UrMemberDetail.new({name:member["name"], member_id:member["id"], user_reservation_id:ur.id})
          ur_member_details.save!
        end
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

    if ur.booking_date < Date.yesterday then
      render json: {message:"Cannot delete a reservation that is older than 24 hours ago"}
      return
    end

    ur.canceled_by_club!

    render json: {message:"Reservation #{ur.id} canceld by #{current_user.name}" }
  end

  # PUT/PATCH    /admin/golf_clubs/:id(.:format)
  # required params :flight_info => {:pax, :buggy, :caddy, :insurance }
  def update
    #update the schedule and recalculate the pricing

    flight_info = params[:flight_info]
    ur = UserReservation.find(params[:id])

    #if trying to update anything that is older than 24 hours, cancel the update
    if ur.booking_date < Date.yesterday then
      render json: {message:"Cannot update reservation that is older than 24 hours ago"}
      return
    end

    ur.transaction do
      ur.update_counts(flight_info)
    end
    render json: {message:"Update Pricing for #{ur.id}"}
  end

  # POST     /admin/user_reservations/:user_reservation_id/confirm
  #   Parameters: {"flight"=>{"pax"=>"3", "member"=>"1", "buggy"=>"1", "caddy"=>"1", "insurance"=>"4",
  #      "members"=>{"0"=>{"name"=>"member one", "member_id"=>"abc 123", "id"=>"18"}},
  #      "tax"=>"89.34", "totalPrice"=>"1578.34"},
  #      "user_reservation_id"=>"166"}

  def confirm
    ur = UserReservation.find(params[:user_reservation_id])

    #block confirmation if reservation is older than 24 hours ago
    if ur.booking_date < Date.yesterday then
      render json: {message:"Cannot confirm a reservation that is older than 24 hours ago"}
      return
    end

    ur.transaction do
      flight_info = params[:flight_info]
      ur.update_counts(flight_info)

      ur.reservation_confirmed!

    end
    render json: {message:"Reservation #{ur.id} confirmed"}
  end

  # POST /admin/user_reservations/stats
  # expected id_list
  def stats
    result = UserReservation.stats params[:id_list]
    render json: {revenue:result[:totalRevenue]}
  end
end
