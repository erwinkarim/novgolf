class AddInvoiceItemCategoryToInvoiceItem < ActiveRecord::Migration[5.0]
  def change
    add_reference :invoice_items, :invoice_item_category, foreign_key: true
  end
end
