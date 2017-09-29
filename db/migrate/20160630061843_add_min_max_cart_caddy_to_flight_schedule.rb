class AddMinMaxCartCaddyToFlightSchedule < ActiveRecord::Migration[5.1]
  def change
    add_column :flight_schedules, :min_cart, :integer, { default:0 }
    add_column :flight_schedules, :max_cart, :integer, { default:2 }
    add_column :flight_schedules, :min_caddy, :integer, { default:0 }
    add_column :flight_schedules, :max_caddy, :integer, { default:2 }
  end
end
