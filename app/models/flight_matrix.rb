class FlightMatrix < ActiveRecord::Base
  belongs_to :flight_matrix
  has_many :user_reservations
  has_one :user_reservation, -> (booking_date){ where("user_reservations.booking_date in ?", booking_date) }
  validates_presence_of :flight_schedule_id, :tee_time

  # each tee time is unique to flight schedule
  validates :tee_time, :uniqueness => { :scope => [:flight_schedule_id] }

  #at least on of day0 to day1 must be populated
  validate :one_day_presence?

  # todo: ensure that tee times are not conflicted with other flight schedules of the same golf club
  validate :non_conflict?

  after_initialize :init

  def init
    self.day1 ||= 1
    self.tee_time ||= "07:00am"
  end

  #validates that at least one of the dayX fields is populated
  def one_day_presence?
    if %w(day0 day1 day2 day3 day4 day5 day6 day7 ).all?{|attr| self[attr].blank? || self[attr].nil? }
      puts "cannot all be blank"
      errors.add :base, "At least one day must be populated"
      #raise ActiveRecord::RecordInvalid
    end
  end

  #ensure that this schedule does not conflict w/ other schedules in the same golf club
  def non_conflict?
    return true
  end
end
