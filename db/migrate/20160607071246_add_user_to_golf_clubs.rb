class AddUserToGolfClubs < ActiveRecord::Migration[5.1]
  def change
    add_reference :golf_clubs, :user, index: true, foreign_key: true
  end
end
