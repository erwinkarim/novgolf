class RemoveTimeFromGolfClub < ActiveRecord::Migration[5.1]
  def change
    remove_column :golf_clubs, :open_hour, :integer
    remove_column :golf_clubs, :close_hour, :integer
  end
end
