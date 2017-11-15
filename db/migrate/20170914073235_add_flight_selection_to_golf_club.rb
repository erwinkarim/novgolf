class AddFlightSelectionToGolfClub < ActiveRecord::Migration[5.1]
  def change
    add_column :golf_clubs, :flight_selection_method, :integer, default: 0
  end
end
