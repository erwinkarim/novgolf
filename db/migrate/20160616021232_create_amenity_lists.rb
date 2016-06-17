class CreateAmenityLists < ActiveRecord::Migration
  def change
    create_table :amenity_lists do |t|
      t.references :golf_club, index: true, foreign_key: true
      t.references :amenity, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
