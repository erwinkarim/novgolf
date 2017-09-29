class AddDatesToChargeSchedule < ActiveRecord::Migration[5.1]
  def change
    add_column :charge_schedules, :start_date, :datetime
    add_column :charge_schedules, :end_date, :datetime
  end
end
