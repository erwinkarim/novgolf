class CreateTaxSchedules < ActiveRecord::Migration[5.1]
  def change
    create_table :tax_schedules do |t|
      t.text :country, limit:3
      t.decimal :rate, precision:6, scale:5
      t.timestamps null: false
    end
  end
end
