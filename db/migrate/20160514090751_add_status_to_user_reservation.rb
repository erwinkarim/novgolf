class AddStatusToUserReservation < ActiveRecord::Migration
  def change
    add_column :user_reservations, :status, :integer
  end
end
