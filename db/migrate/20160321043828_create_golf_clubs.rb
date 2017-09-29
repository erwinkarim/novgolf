class CreateGolfClubs < ActiveRecord::Migration[5.1]
  def change
    create_table :golf_clubs do |t|

      t.timestamps null: false
    end
  end
end
