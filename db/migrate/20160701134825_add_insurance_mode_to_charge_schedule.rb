class AddInsuranceModeToChargeSchedule < ActiveRecord::Migration
  def change
    add_column :charge_schedules, :insurance_mode, :integer, { default:0 }
  end
end
