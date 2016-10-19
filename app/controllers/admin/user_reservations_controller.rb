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

  def create
  end
end
