class CreateAmenities < ActiveRecord::Migration
  def change
    create_table :amenities do |t|
      t.string :name
      t.string :label
      t.string :icon

      t.timestamps null: false
    end
  end
end
