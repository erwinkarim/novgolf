class UserReservation < ActiveRecord::Base
  belongs_to :user
  belongs_to :charge_schedule
  belongs_to :golf_club
  belongs_to :flight_matrix

  #each club id should have a unique booking date and time
  validates :golf_club_id, uniqueness: {
    scope: [:booking_date, :booking_time],
    #failed/canceled payment will be recorded, but uniqueness constraint would not be uphold
    unless: Proc.new{ |reserve| reserve.payment_failed? || reserve.canceled_by_club? || reserve.canceled_by_user? }
  }
  validates :flight_matrix_id, presence: true
  #validates :token, uniqueness: true
  #need to check when this feature is available
  has_secure_token

  enum status: [:reservation_created, :payment_attempted, :payment_confirmed,
    :reservation_confirmed, :canceled_by_club, :canceled_by_user, :payment_failed]

  def total_price
    actual_pax * count_pax +
    actual_buggy * count_buggy +
    actual_caddy * count_caddy +
    actual_insurance * count_insurance
  end
end
