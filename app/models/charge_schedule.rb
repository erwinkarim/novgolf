class ChargeSchedule < ActiveRecord::Base
  belongs_to :golf_club
  belongs_to :flight_schedule
  belongs_to :tax_schedule

  after_initialize :init

  validates_presence_of :golf_club_id, :flight_schedule_id
  validates_presence_of :session_price, :cart, :caddy, :insurance, :insurance_mode
  validates_presence_of :tax_schedule_id

  enum insurance_mode: [ :insurance_optional, :insurance_madatory, :insurance_inclusive ]

  def init
    #drop these in the final version, not used
    self.sessions_per_hour ||= 4
    self.slots_per_session ||= 4
    self.pax_per_slot ||= 4
    self.max_caddy_per_slot ||= 4
    self.max_buggy_per_slot ||= 2

    # retain them instead
    self.session_price ||= 90
    self.caddy ||= 0
    self.cart ||= 100
    self.insurance ||= 10

    self.insurance_mode ||= 0

    self.tax_schedule_id ||= 1
  end

end
