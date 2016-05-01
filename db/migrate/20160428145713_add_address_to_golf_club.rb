class AddAddressToGolfClub < ActiveRecord::Migration
  def change
    add_column :golf_clubs, :address, :string
  end
end
