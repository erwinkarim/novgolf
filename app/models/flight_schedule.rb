class FlightSchedule < ActiveRecord::Base
  belongs_to :golf_club

  has_many :flight_matrices, :dependent => :destroy
  has_one :charge_schedule, :dependent => :destroy

  validates_presence_of :golf_club_id, :min_pax, :max_pax, :min_cart, :max_cart, :min_caddy, :max_caddy

  after_initialize :init

  def init
    self.min_pax ||= 2
    self.max_pax ||= 2

    self.min_cart ||= 0
    self.min_cart ||= 2

    self.min_caddy ||= 0
    self.max_caddy ||= 2
  end
end
