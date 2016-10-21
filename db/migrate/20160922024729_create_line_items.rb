class CreateLineItems < ActiveRecord::Migration
  def change
    create_table :line_items do |t|
      t.text :name, limit:160
      t.string :description 
      t.boolean :mandatory

      t.timestamps null: false
    end
  end
end
