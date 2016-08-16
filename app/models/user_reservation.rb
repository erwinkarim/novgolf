class UserReservation < ActiveRecord::Base
  belongs_to :user
  belongs_to :charge_schedule
  belongs_to :golf_club
  belongs_to :flight_matrix

  has_one :review, as: :topic

  #each club id should have a unique booking date and time
  validates :golf_club_id, uniqueness: {
    scope: [:booking_date, :booking_time],
    #validation will be enforced during creation, payment and confirmation stage, but not when it was canceled or failed
    conditions: -> { where( status: [0,1,2,3])}
  }
  #validates :token, uniqueness: true
  #need to check when this feature is available
  validates_presence_of :user_id, :flight_matrix_id
  validates_presence_of :actual_pax, :actual_buggy, :actual_caddy, :actual_insurance
  validates_presence_of :count_pax, :count_buggy, :count_caddy, :count_insurance
  validates_presence_of :booking_date, :booking_time
  validates_presence_of :status
  has_secure_token

  enum status: [:reservation_created, :payment_attempted, :payment_confirmed,
    :reservation_confirmed, :canceled_by_club, :canceled_by_user, :payment_failed]

  after_initialize :init

  def init
    status ||= 0
  end

  def total_price
    actual_pax * count_pax +
    actual_buggy * count_buggy +
    actual_caddy * count_caddy +
    actual_insurance * count_insurance
  end

  def booking_datetime
    "#{self.booking_date} #{self.booking_time.to_datetime.strftime('%H:%M')} +0000"
  end
end
