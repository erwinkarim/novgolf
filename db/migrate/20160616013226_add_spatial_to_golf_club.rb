class AddSpatialToGolfClub < ActiveRecord::Migration[5.1]
  def change
    add_column :golf_clubs, :lat, :string
    add_column :golf_clubs, :lng, :string
  end
end
