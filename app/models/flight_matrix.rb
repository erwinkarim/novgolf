class FlightMatrix < ActiveRecord::Base
  belongs_to :flight_matrix
  has_many :user_reservations
  has_one :user_reservation, -> (booking_date){ where("user_reservations.booking_date in ?", booking_date) }
  validates_presence_of :tee_time
  # each tee time is unique to flight schedule
  validates :tee_time, :uniqueness => { :scope => :flight_schedule_id }
end
