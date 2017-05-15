class AddTelephoneToUser < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :telephone, :string, limit:12
  end
end
