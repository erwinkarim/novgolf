class AddBillingDateToInvoice < ActiveRecord::Migration[5.0]
  def change
    add_column :invoices, :billing_date, :date
  end
end
