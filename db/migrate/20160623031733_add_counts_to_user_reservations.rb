class AddCountsToUserReservations < ActiveRecord::Migration[5.1]
  def change
    add_column :user_reservations, :actual_insurance, :decimal, :precision => 8, :scale => 2
    add_column :user_reservations, :count_caddy, :integer
    add_column :user_reservations, :count_buggy, :integer
    add_column :user_reservations, :count_pax, :integer
    add_column :user_reservations, :count_insurance, :integer
  end
end
