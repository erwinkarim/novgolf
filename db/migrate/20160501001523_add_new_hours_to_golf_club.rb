class AddNewHoursToGolfClub < ActiveRecord::Migration
  def change
    add_column :golf_clubs, :open_hour, :time
    add_column :golf_clubs, :close_hour, :time
  end
end
