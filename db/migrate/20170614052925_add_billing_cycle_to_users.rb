class AddBillingCycleToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :billing_cycle, :integer
  end
end
