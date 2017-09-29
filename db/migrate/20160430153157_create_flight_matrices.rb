class CreateFlightMatrices < ActiveRecord::Migration[5.1]
  def change
    create_table :flight_matrices do |t|
      t.references :flight_schedule, index: true, foreign_key: true
      t.integer :timeslot
      t.integer :day0
      t.integer :day1
      t.integer :day2
      t.integer :day3
      t.integer :day4
      t.integer :day5
      t.integer :day6
      t.integer :day7

      t.timestamps null: false
    end
  end
end
