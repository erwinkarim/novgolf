class AddStuffToUrTransactions < ActiveRecord::Migration
  def change
    add_reference :ur_transactions, :user_reservation, index: true, foreign_key: true
    add_column :ur_transactions, :trans_amount, :decimal, :precision => 8, :scale => 2
    add_column :ur_transactions, :detail_type, :integer
    add_column :ur_transactions, :notes, :string
  end
end
