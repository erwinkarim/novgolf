class DropHomeClubFromUser < ActiveRecord::Migration[5.1]
  def change
    if column_exists? :users, :home_club then
      remove_column :users, :home_club
    end
  end
end
