class AddSecondFlightTimesToFlightMatrix < ActiveRecord::Migration[5.0]
  def change
    add_column :flight_matrices, :second_tee_time, :time
  end
end
