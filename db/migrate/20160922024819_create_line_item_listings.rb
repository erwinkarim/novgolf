class CreateLineItemListings < ActiveRecord::Migration[5.1]
  def change
    create_table :line_item_listings do |t|
      t.decimal :rate, precision:10, scale:2
      t.boolean :taxed
      t.references :charge_schedule, index: true, foreign_key: true
      t.references :line_item, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
