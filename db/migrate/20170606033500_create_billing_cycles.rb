class CreateBillingCycles < ActiveRecord::Migration[5.0]
  def change
    create_table :billing_cycles do |t|
      t.references :user, foreign_key: true
      t.integer :cycle

      t.timestamps
    end
  end
end
