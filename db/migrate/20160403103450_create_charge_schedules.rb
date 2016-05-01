class CreateChargeSchedules < ActiveRecord::Migration
  def change
    create_table :charge_schedules do |t|
      t.references :golf_club, index: true, foreign_key: true
      t.decimal :caddy, :precision => 8, :scale => 2
      t.decimal :cart, :precision => 8, :scale => 2
      t.integer :sessions_per_hour
      t.integer :slots_per_session
      t.integer :pax_per_slot

      t.timestamps null: false
    end
  end
end
