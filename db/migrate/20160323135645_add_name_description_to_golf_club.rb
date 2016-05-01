class AddNameDescriptionToGolfClub < ActiveRecord::Migration
  def change
    add_column :golf_clubs, :name, :string
    add_column :golf_clubs, :description, :string
  end
end
