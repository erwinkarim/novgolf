class CreateFlightSchedules < ActiveRecord::Migration[5.1]
  def change
    create_table :flight_schedules do |t|
      t.string :flight_times
      t.integer :min_pax
      t.integer :max_pax

      t.timestamps null: false
    end
  end
end
