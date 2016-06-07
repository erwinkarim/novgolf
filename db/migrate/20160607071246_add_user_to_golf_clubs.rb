class AddUserToGolfClubs < ActiveRecord::Migration
  def change
    add_reference :golf_clubs, :user, index: true, foreign_key: true
  end
end
