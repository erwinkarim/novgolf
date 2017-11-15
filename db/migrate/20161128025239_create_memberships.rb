class CreateMemberships < ActiveRecord::Migration[5.1]
  def change
    create_table :memberships do |t|
      t.references :user, index: true, foreign_key: true
      t.references :golf_club, index: true, foreign_key: true
      t.date :expires_at
      t.string :alt_club_name

      t.timestamps null: false
    end
  end
end
