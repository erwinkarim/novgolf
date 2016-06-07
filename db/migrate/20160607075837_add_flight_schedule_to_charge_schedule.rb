class AddFlightScheduleToChargeSchedule < ActiveRecord::Migration
  def change
    add_reference :charge_schedules, :flight_schedule, index: true, foreign_key: true
  end
end
