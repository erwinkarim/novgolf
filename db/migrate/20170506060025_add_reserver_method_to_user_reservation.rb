class AddReserverMethodToUserReservation < ActiveRecord::Migration[5.0]
  def change
    add_column :user_reservations, :reserve_method, :integer, default: 0
  end
end
