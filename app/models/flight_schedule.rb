class FlightSchedule < ActiveRecord::Base
  belongs_to :golf_club

  has_many :flight_matrices
  has_one :charge_schedule

  validates_presence_of :min_pax, :max_pax
end
