class Admin::UrContactsController < ApplicationController
  # PATCH|POST    /admin/user_reservations/:user_reservation_id/ur_contacts(.:format)
  # create and link the user_reservation to the contact info
  def ur_contact_update
    #skip if all three field are empty
    if params[:ur_contact][:name].blank? && params[:ur_contact][:email].blank? && params[:ur_contact][:telephone].blank? then
      Rails.logger.info "Zero info on contact for reservation #{params[:user_reservation_id]}. Skipping..."
      head :ok
      return
    end

    #load the user reservation
    ur = UserReservation.find(params[:user_reservation_id])

    #skip if the reservation method is online
    if ur.online? then
      Rails.logger.info "Reservation #{params[:user_reservation_id]} is created online. Skipping..."
      head :ok
      return
    end

    #scenario #1: reuse existing ur_contact. relink the reservation to the contact
    if !params[:ur_contact][:id].empty? then
      Rails.logger.info "Linking contact #{params[:ur_contact][:id]} to reservation #{params[:user_reservation_id]}..."

      head :ok
      return
    end

    #screnario #2: new ur_contact. create a new ur_contact, then link to current reservation
    Rails.logger.info "Creating new contact for reservation #{params[:user_reservation_id]}..."

  end
end
