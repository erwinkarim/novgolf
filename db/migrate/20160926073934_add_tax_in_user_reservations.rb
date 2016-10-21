class AddTaxInUserReservations < ActiveRecord::Migration
  def change
    add_column :user_reservations, :actual_tax, :decimal, { precision:10, scale:2}
  end
end
