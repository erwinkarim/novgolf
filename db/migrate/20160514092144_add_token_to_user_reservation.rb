class AddTokenToUserReservation < ActiveRecord::Migration
  def change
    add_column :user_reservations, :token, :string
  end
end
