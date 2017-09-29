class AddInsuranceModeToChargeSchedule < ActiveRecord::Migration[5.1]
  def change
    add_column :charge_schedules, :insurance_mode, :integer, { default:0 }
  end
end
