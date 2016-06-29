class AddNoteToChargeSchedule < ActiveRecord::Migration
  def change
    add_column :charge_schedules, :note, :text, :limit => 2048
  end
end
