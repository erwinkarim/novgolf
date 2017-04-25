class FlightSchedule < ActiveRecord::Base
  belongs_to :golf_club

  has_many :flight_matrices, :dependent => :destroy
  has_one :charge_schedule, :dependent => :destroy

  validates_presence_of :golf_club_id, :min_pax, :max_pax, :min_cart, :max_cart, :min_caddy, :max_caddy
  validates_presence_of :start_active_at, :end_active_at

  after_initialize :init

  validates :min_caddy, numericality:{only_integer:true, greater_than_or_equal_to:0}
  validates :max_caddy, numericality:{only_integer:true, greater_than_or_equal_to:0}

  validates :min_cart, numericality:{only_integer:true, greater_than_or_equal_to:0}
  validates :max_cart, numericality:{only_integer:true, greater_than_or_equal_to:0}

  validates :min_pax, numericality:{only_integer:true, greater_than_or_equal_to:2}
  validates :max_pax, numericality:{only_integer:true, greater_than_or_equal_to:2}

  validate :min_caddy_must_less_eq_max_caddy
  validate :min_cart_must_less_eq_max_cart
  validate :min_pax_must_less_eq_max_pax

  def init
    self.min_pax ||= 2
    self.max_pax ||= 4

    self.min_cart ||= 0
    self.max_cart ||= 2

    self.min_caddy ||= 0
    self.max_caddy ||= 2

    self.start_active_at ||= DateTime.parse("01-01-2017")
    self.end_active_at ||= DateTime.parse("01-01-3017")
  end

  # set the schedule as inactive (kinda of delete it)
  def setInactive
    self.update_attribute(:end_active_at, DateTime.now - 1.minute)
  end
  
  private
  def min_caddy_must_less_eq_max_caddy
    self.init
    errors.add(:min_caddy, "must less or equal max_caddy") unless
      min_caddy <= max_caddy
  end

  def min_cart_must_less_eq_max_cart
    self.init
    errors.add(:min_cart, "must less or equal max_caddy") unless
      min_cart <= max_cart
  end

  def min_pax_must_less_eq_max_pax
    self.init
    errors.add(:min_pax, "must less or equal max_pax") unless
      self.min_pax <= self.max_pax
  end

end
