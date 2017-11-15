class AddProfilePictureToUser < ActiveRecord::Migration[5.1]
  def change
    #add_reference :users, :profile_picture, index: true, foreign_key: true
    add_column :users, :profile_picture_id, :integer
    #add_foreign_key :users, :photos, { column: :profile_picture }
  end
end
