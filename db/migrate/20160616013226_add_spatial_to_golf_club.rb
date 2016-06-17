class AddSpatialToGolfClub < ActiveRecord::Migration
  def change
    add_column :golf_clubs, :lat, :string
    add_column :golf_clubs, :lng, :string
  end
end
