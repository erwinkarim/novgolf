class AddActiveDatesToFlightSchedules < ActiveRecord::Migration[5.0]
  def change
    add_column :flight_schedules, :start_active_at, :datetime, default: DateTime.parse("01-01-2017")
    add_column :flight_schedules, :end_active_at, :datetime, default: DateTime.parse("01-01-3017")
  end
end
