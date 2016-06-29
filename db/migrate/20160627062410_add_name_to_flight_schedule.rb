class AddNameToFlightSchedule < ActiveRecord::Migration
  def change
    add_column :flight_schedules, :name, :string
  end
end
