class Admin::UrTransactionsController < ApplicationController
  before_action :admins_only

  #list transactions for a particular reservation
  # GET      /admin/user_reservations/:user_reservation_id/ur_transactions(.:format)
  def index
    #check is reservation belongs to admin that is viewing it
    ur = UserReservation.find(params[:user_reservation_id])
    if ur.golf_club.user_id != current_user.id then
      render json: {message:'You do not own this reservation'}, status: :unauthorized
      return
    end

    #returns outstanding balance and list of transactions on this reservation
    render json: {outstanding: ur.check_outstanding, transactions:ur.ur_transactions}
  end
end
