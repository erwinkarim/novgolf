class AddCodeToInvoiceItemCategory < ActiveRecord::Migration[5.0]
  def change
    add_column :invoice_item_categories, :code, :string, limit:3
  end
end
