class AddHoursToGolfClub < ActiveRecord::Migration[5.1]
  def change
    add_column :golf_clubs, :open_hour, :integer
    add_column :golf_clubs, :close_hour, :integer
  end
end
