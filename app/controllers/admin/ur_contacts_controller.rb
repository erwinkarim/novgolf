class Admin::UrContactsController < ApplicationController
  before_action :admins_only

  # PATCH|POST    /admin/user_reservations/:user_reservation_id/ur_contacts(.:format)
  # create and link the user_reservation to the contact info
  def ur_contact_update
    #skip if all three field are empty
    if params[:ur_contact][:name].blank? && params[:ur_contact][:email].blank? && params[:ur_contact][:telephone].blank? then
      Rails.logger.info "Zero info on contact for reservation #{params[:user_reservation_id]}. Skipping..."
      head :ok
      return
    end

    #skip if there's no name
    if params[:ur_contact][:name].blank? then
      Rails.logger.info "Name field is blank. Skipping..."
    end

    #load the user reservation
    ur = UserReservation.find(params[:user_reservation_id])

    #skip if the reservation method is online
    if ur.online? then
      Rails.logger.info "Reservation #{params[:user_reservation_id]} is created online. Skipping..."
      head :ok
      return
    end

    #scenario #1a: ur_contact id is detected
    if !params[:ur_contact][:id].empty? then
      Rails.logger.info "Linking contact #{params[:ur_contact][:id]} to reservation #{params[:user_reservation_id]}..."

      ur.update_attributes({contact_id:params[:ur_contact][:id], contact_type:params[:ur_contact][:type]})

      head :accepted
      return
    end

    #screnario #2: current ur has a contact_id, check if it's big change or not
    # if the name is the same, just update the email/telephone, otherwise go to
    if !ur.contact_id.blank? && params[:ur_contact][:id].empty? then
      if ur.contact.name == params[:ur_contact][:name] then
        #sanity checks, the contact type is UrContact and you own it
        if ur.contact_type == "UrContact" then
          UrContact.transaction do
            ur.contact.update_attributes({email:params[:ur_contact][:email], telephone:params[:ur_contact][:telephone]})
          end
          head :accepted
          return
        else
          head :ok
          return
        end
      end
    end

    #screnario #3: no current contact, or the chages are too big
    # default screnario is to create a new contact and link it
    Rails.logger.info "Creating new contact for reservation #{params[:user_reservation_id]}..."
    UrContact.transaction do
      #create the ur contact
      urContact = current_user.ur_contacts.new({name:params[:ur_contact][:name],
        email:params[:ur_contact][:email], telephone:params[:ur_contact][:telephone]})
      if urContact.save then
        ur.update_attributes({contact_id:urContact.id, contact_type:"UrContact"})
        head :created
        return
      else
        render json: {errors:urContact.errors.messages}, status: :internal_server_error
      end
    end

  end

  # GET      /admin/ur_contacts/suggest(.:format)
  #
  def suggest
    if !params.has_key? :q then
      head :ok
      return
    end

    search_stmt = params[:q].upcase
    current_user_id = current_user.id

    results = UrContact.where.has{
      (user_id == current_user_id) &
      (upper(name).like "%#{search_stmt}%") |
      (upper(email).like "%#{search_stmt}%") |
      (upper(telephone).like "%#{search_stmt}%")
    }.map{ |x| {value:x.name, data:x} }

    render json: {query:params[:q], suggestions:results}
  end
end
