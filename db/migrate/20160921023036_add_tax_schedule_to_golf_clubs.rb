class AddTaxScheduleToGolfClubs < ActiveRecord::Migration[5.1]
  def change
    add_reference :golf_clubs, :tax_schedule, index: true, foreign_key: true
  end
end
