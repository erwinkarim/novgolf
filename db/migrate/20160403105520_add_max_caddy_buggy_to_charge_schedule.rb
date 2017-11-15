class AddMaxCaddyBuggyToChargeSchedule < ActiveRecord::Migration[5.1]
  def change
    add_column :charge_schedules, :max_caddy_per_slot, :integer
    add_column :charge_schedules, :max_buggy_per_slot, :integer
  end
end
