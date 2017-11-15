class AddStatusToUserReservation < ActiveRecord::Migration[5.1]
  def change
    add_column :user_reservations, :status, :integer
  end
end
