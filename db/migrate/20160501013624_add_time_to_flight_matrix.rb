class AddTimeToFlightMatrix < ActiveRecord::Migration[5.1]
  def change
    add_column :flight_matrices, :tee_time, :time
  end
end
