class Admin::UserReservationsController < ApplicationController
  before_action :admins_only

  # GET      /admin/user_reservations/:id(.:format)
  #TODO: allow golf admin to view the admin, especially when it'd made by other members
  def show
    user_reservation = UserReservation.find(params[:id])

    if user_reservation.golf_club.user == current_user then
      render json: {
        :user_reservation => user_reservation.attributes.merge({
          reserved_by: user_reservation.user,
          ur_contact: user_reservation.contact.attributes.merge({
            contact_type:user_reservation.contact_type
            }),
          total_price:user_reservation.total_price,
          ur_member_details:user_reservation.ur_member_details.to_a,
          status_text:user_reservation.status}
        )
      }
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
      if flight_info["members"].nil? then
        flight_info["members"] = Array.new
      end
      if flight_info["members"].inject(false){|p,v| p || (v["name"].empty? || v["member_id"].empty?)} then
        render json: {message:'Failed to create a reservation'}, status: :unprocessable_entity
        return
      end
    end

    ur = UserReservation.new
    UserReservation.transaction do
      #create the reservation
      ur = UserReservation.create_reservation params[:flight_matrix_id], current_user.id, params[:booking_date], params[:flight_info],
        {reserve_method:UserReservation.reserve_methods[:dashboard]}
      unless params.has_key?(:flight_info) then
        flight_info["members"].each_pair do |index, member|
          ur_member_details = UrMemberDetail.new({name:member["name"], member_id:member["id"], user_reservation_id:ur.id})
          ur_member_details.save!
        end
      end
    end

    if ur.valid? then
      ur.payment_attempted!
      render json: {message:"Reservation #{ur.id} created", reservation:ur}, status: :ok
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
    flight_info = params[:flight_info]
    ur = UserReservation.find(params[:id])

    #if trying to update anything that is older than 24 hours, cancel the update
    if ur.booking_date < Date.yesterday then
      render json: {message:"Cannot update reservation that is older than 24 hours ago"}, status: :unprocessable_entity
      return
    end

    #check the members list to ensure that they are sane
    if params.has_key?(:flight_info) && flight_info.has_key?(:members) then
      if flight_info["members"].nil? then
        flight_info["members"] = Array.new
      end
      if flight_info["members"].inject(false){|p,v| p || (v["name"].empty? || v["member_id"].empty?)} then
        render json: {message:"Members can't be blank on reservation #{ur.id}"}, status: :unprocessable_entity
        return
      end
    end

    #everything is awesome, now really update the counts and outstanding values
    ur.transaction do
      ur.update_counts(flight_info)
      if ur.check_outstanding > 0 then
        ur.payment_attempted!
      else
        #records that you have some change needs to be given back
        Rails.logger.info "should give back change of #{ur.check_outstanding}"

        #operator will use their own cc terminal to refund. in the future
        # will use our own system to do refunds
        urTransaction = ur.ur_transactions.new
        urTransaction.assign_attributes({detail_type: UrTransaction.detail_types[:cash_change], trans_amount: -(ur.check_outstanding) })
        urTransaction.save!
      end
    end

    render json: {message:"Update Pricing for #{ur.id}"}
  end

  # POST     /admin/user_reservations/:user_reservation_id/pay
  # handle payment
  # parameters:   {
  #   "flight_info"=>{"pax"=>"2", "member"=>"0", "buggy"=>"1", "caddy"=>"1", "insurance"=>"0", "tax"=>"55.5", "totalPrice"=>"980.5"},
  #   "payment_method"=>"cash", "payment_amount"=>"1000", "user_reservation_id"=>"218"
  # }
  # check for method
  def pay
    ur = UserReservation.find(params[:user_reservation_id])

    #block confirmation if reservation is older than 24 hours ago
    if ur.booking_date < Date.yesterday then
      render json: {message:"Cannot confirm a reservation that is older than 24 hours ago"}
      return
    end

    #ensure that payment is always enough to go through

    ur.transaction do
      flight_info = params[:flight_info]
      #update flight info (might induce new transaction if delta change)
      ur.update_counts(flight_info)

      #after update count, record payment method (cc or cash)
      payment_method = params[:payment_method] == "cc" ? UrTransaction.detail_types[:cc_payment] : UrTransaction.detail_types[:cash_payment]
      payment_amount = params[:payment_method] == "cc" ? ur.check_outstanding : params[:payment_amount].to_f
      ur.record_payment payment_amount, payment_method

      #finally, actually confirm the reservation
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

  #POST     /admin/user_reservations/:user_reservation_id/confirm_members
  # confirm the members, change the reservation state to confirmed or awaiting payment
  # this assumed that the operator manually verified the members and the acknowledge the
  # members in the flight are genunie
  def confirm_members
    ur = UserReservation.find(params[:user_reservation_id])

    #need to check the current user owns the reservation

    if ur.check_outstanding.zero? then
      ur.reservation_confirmed!
    else
      ur.payment_attempted!
    end

    render json: {message:"Members Verified for #{ur.id}", user_reservation:ur}

  end
end
