class AddPriceToChargeSchedule < ActiveRecord::Migration[5.1]
  def change
    add_column :charge_schedules, :session_price, :decimal, :precision => 8, :scale => 2
  end
end
