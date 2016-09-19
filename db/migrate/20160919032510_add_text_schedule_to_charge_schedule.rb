class AddTextScheduleToChargeSchedule < ActiveRecord::Migration
  def change
    add_reference :charge_schedules, :tax_schedule, index: true, foreign_key: true
  end
end
