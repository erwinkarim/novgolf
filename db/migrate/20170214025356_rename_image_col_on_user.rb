class RenameImageColOnUser < ActiveRecord::Migration[5.0]
  def self.up
    rename_column :users, :image, :image_path
  end

  def self.down
    rename_column :users, :image_path, :image
  end
end
