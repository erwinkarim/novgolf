class CreateUrContacts < ActiveRecord::Migration[5.1]
  def change
    create_table :ur_contacts do |t|
      t.references :user, foreign_key: true
      #t.references :user_reservation, foreign_key: true
      t.string :name
      t.string :email
      t.string :telephone

      t.timestamps
    end
  end
end
