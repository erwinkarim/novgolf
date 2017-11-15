class AddNoteToChargeSchedule < ActiveRecord::Migration[5.1]
  def change
    add_column :charge_schedules, :note, :text, :limit => 2048
  end
end
