class CreateUrInvoices < ActiveRecord::Migration[5.1]
  def change
    create_table :ur_invoices do |t|
      t.references :user_reservation, foreign_key: true
      t.references :invoice, foreign_key: true
      t.decimal :final_total, precision: 10, scale: 2
      t.integer :billing_category

      t.timestamps
    end
  end
end
