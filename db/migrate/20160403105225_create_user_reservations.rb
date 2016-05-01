class CreateUserReservations < ActiveRecord::Migration
  def change
    create_table :user_reservations do |t|
      t.references :user, index: true, foreign_key: true
      t.references :charge_schedule, index: true, foreign_key: true
      t.integer :actual_caddy
      t.integer :actual_buggy
      t.integer :actual_pax

      t.timestamps null: false
    end
  end
end
