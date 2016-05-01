class AddGolfCulbToFlightSchedule < ActiveRecord::Migration
  def change
    add_reference :flight_schedules, :golf_club, index: true, foreign_key: true
  end
end
