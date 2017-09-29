class AddTaxInUserReservations < ActiveRecord::Migration[5.1]
  def change
    add_column :user_reservations, :actual_tax, :decimal, { precision:10, scale:2}
  end
end
