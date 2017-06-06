class AddBillingPeriodToInvoice < ActiveRecord::Migration[5.0]
  def change
    add_column :invoices, :start_billing_period, :date
    add_column :invoices, :end_billing_period, :date
  end
end
