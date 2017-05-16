class AddFlightOrderToFlightMatrices < ActiveRecord::Migration[5.0]
  def change
    add_column :flight_matrices, :flight_order, :integer, default:0
  end
end
