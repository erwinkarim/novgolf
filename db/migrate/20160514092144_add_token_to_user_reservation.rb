class AddTokenToUserReservation < ActiveRecord::Migration[5.1]
  def change
    add_column :user_reservations, :token, :string
  end
end
