class CreateInvoiceItemCategories < ActiveRecord::Migration[5.0]
  def change
    create_table :invoice_item_categories do |t|
      t.string :description, limit:500
      t.string :caption, limit:80

      t.timestamps
    end
  end
end
