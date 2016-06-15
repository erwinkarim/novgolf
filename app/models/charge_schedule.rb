class ChargeSchedule < ActiveRecord::Base
  belongs_to :golf_club
  belongs_to :flight_schedule

  after_initialize :init

  validates_presence_of :session_price, :cart, :caddy, :insurance

  def init
    self.sessions_per_hour ||= 4
    self.slots_per_session ||= 4
    self.pax_per_slot ||= 4
    self.max_caddy_per_slot ||= 4
    self.max_buggy_per_slot ||= 2

    self.session_price ||= 90
    self.caddy ||= 0
    self.cart ||= 100
    self.insurance ||= 10
  end

end
