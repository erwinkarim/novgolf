class AddTaxScheduleToGolfClubs < ActiveRecord::Migration
  def change
    add_reference :golf_clubs, :tax_schedule, index: true, foreign_key: true
  end
end
