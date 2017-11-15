class CreateUrMemberDetails < ActiveRecord::Migration[5.1]
  def change
    create_table :ur_member_details do |t|
      t.string :name
      t.string :member_id
      t.references :user_reservation, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
