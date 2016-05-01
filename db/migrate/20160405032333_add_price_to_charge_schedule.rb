class AddPriceToChargeSchedule < ActiveRecord::Migration
  def change
    add_column :charge_schedules, :session_price, :decimal, :precision => 8, :scale => 2
  end
end
