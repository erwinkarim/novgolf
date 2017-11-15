class AddContactInfoToGolfClub < ActiveRecord::Migration[5.1]
  def change
    add_column :golf_clubs, :telephone, :string, limit:12
    add_column :golf_clubs, :email, :string, limit:40
  end
end
