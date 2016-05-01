class AddTimeToFlightMatrix < ActiveRecord::Migration
  def change
    add_column :flight_matrices, :tee_time, :time
  end
end
