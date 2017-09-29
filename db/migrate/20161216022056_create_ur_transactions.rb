class CreateUrTransactions < ActiveRecord::Migration[5.1]
  def change
    create_table :ur_transactions do |t|

      t.timestamps null: false
    end
  end
end
