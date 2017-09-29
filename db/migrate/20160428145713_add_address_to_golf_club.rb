class AddAddressToGolfClub < ActiveRecord::Migration[5.1]
  def change
    add_column :golf_clubs, :address, :string
  end
end
