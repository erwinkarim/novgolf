class AddNotesToInvoiceItem < ActiveRecord::Migration[5.0]
  def change
    add_column :invoice_items, :note, :string, limit:160
  end
end
