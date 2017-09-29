class AddHomeClubHandicapToUser < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :home_club, :string
    add_column :users, :handicap, :integer
  end
end
