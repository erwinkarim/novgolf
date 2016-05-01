class FlightMatrix < ActiveRecord::Base
  belongs_to :flight_schedule
  validates_presence_of :tee_time
end
