class FlightSchedule < ActiveRecord::Base
  belongs_to :golf_club

  has_many :flight_matrices, :dependent => :destroy
  has_one :charge_schedule, :dependent => :destroy

  validates_presence_of :min_pax, :max_pax
end
