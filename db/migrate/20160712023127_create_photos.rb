class CreatePhotos < ActiveRecord::Migration
  def change
    create_table :photos do |t|
      t.integer :order
      t.references :user, index: true, foreign_key:true
      t.references :imageable, index: true, polymorphic:true
      t.string :avatar
      t.text :caption, :limit => 160

      t.timestamps null: false
    end
  end
end
