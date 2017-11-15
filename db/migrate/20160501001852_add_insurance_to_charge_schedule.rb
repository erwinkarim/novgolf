class AddInsuranceToChargeSchedule < ActiveRecord::Migration[5.1]
  def change
    add_column :charge_schedules, :insurance, :decimal, :precision => 8, :scale => 2
  end
end
