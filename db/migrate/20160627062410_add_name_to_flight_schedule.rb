class AddNameToFlightSchedule < ActiveRecord::Migration[5.1]
  def change
    add_column :flight_schedules, :name, :string
  end
end
