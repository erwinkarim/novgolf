class CreateInvoiceItems < ActiveRecord::Migration[5.1]
  def change
    create_table :invoice_items do |t|
      t.references :invoice, foreign_key: true
      t.decimal :charges, precision:15, scale:2, default:0.0
      t.timestamps
    end
  end
end
