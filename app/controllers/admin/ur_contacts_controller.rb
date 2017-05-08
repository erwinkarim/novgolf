class Admin::UrContactsController < ApplicationController
  # PATCH|POST    /admin/user_reservations/:user_reservation_id/ur_contacts(.:format)
  def ur_contact_update
    Rails.logger.info "Update contacts for reservation #{params[:user_reservation_id]}"
  end
end
