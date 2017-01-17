class CreateUrTransactions < ActiveRecord::Migration
  def change
    create_table :ur_transactions do |t|

      t.timestamps null: false
    end
  end
end
