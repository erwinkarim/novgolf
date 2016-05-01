class CreateGolfClubs < ActiveRecord::Migration
  def change
    create_table :golf_clubs do |t|

      t.timestamps null: false
    end
  end
end
