class UserReservation < ActiveRecord::Base
  belongs_to :user
  belongs_to :charge_schedule
  belongs_to :golf_club
  belongs_to :flight_matrix

  #each club id should have a unique booking date and time
  validates :golf_club_id, uniqueness: { scope: [:booking_date, :booking_time]}
  validates :flight_matrix_id, presence: true
  #validates :token, uniqueness: true
  has_secure_token

  enum status: [:reservation_created, :payment_attempted, :payment_confirmed,
    :reservation_confirmed, :canceled_by_club, :cancled_by_user, :payment_failed]
end
