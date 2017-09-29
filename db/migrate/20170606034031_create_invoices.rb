class CreateInvoices < ActiveRecord::Migration[5.1]
  def change
    create_table :invoices do |t|
      t.references :user, foreign_key: true
      t.decimal :total_billing, precision: 10, scale: 2

      t.timestamps
    end
  end
end
