class UserReservation < ActiveRecord::Base
  require "assets/name_generator"

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
  validates_presence_of :actual_pax, :actual_buggy, :actual_caddy, :actual_insurance, :actual_tax
  validates_presence_of :count_pax, :count_buggy, :count_caddy, :count_insurance
  validates_presence_of :booking_date, :booking_time
  validates_presence_of :status
  validate :validates_booking_datetime, on: :create

  has_secure_token

  enum status: [:reservation_created, :payment_attempted, :payment_confirmed,
    :reservation_confirmed, :canceled_by_club, :canceled_by_user, :payment_failed]

  after_initialize :init

  def init
    status ||= 0
  end

  def validates_booking_datetime
    #ensure that the booking date and time falls on the correct
    if self.booking_date.nil? || self.booking_time.nil? || self.flight_matrix_id.nil? then
      return false
    else
      fm = FlightMatrix.find(self.flight_matrix_id)

      #check booking_time
      if self.booking_time != fm.tee_time then
        return false
      end

      #check booking_date
      day_of_week = self.booking_date.strftime("%u")
      return fm.attributes["day#{day_of_week}"] == 1
    end
  end

  def total_price
    actual_pax +
    actual_buggy +
    actual_caddy +
    actual_insurance +
    actual_tax
  end

  def booking_datetime
    #"#{self.booking_date} #{self.booking_time.to_datetime.strftime('%H:%M')} +0000"
    DateTime.parse "#{self.booking_date} #{self.booking_time.to_datetime.strftime('%H:%M')} +0000"
  end

  #generate the random user reservation complete with review
  def self.generate_random_reservation user = User.first
    #get the club
    ids = GolfClub.all.limit(100).pluck(:id)
    club = GolfClub.find( ids[rand(0..ids.length-1)])

    #get a random flight_matrix
    fm_ids = club.flight_matrices.pluck(:id)
    fm = FlightMatrix.find(fm_ids[rand(0..fm_ids.length-1)])
    fs = FlightSchedule.find(fm.flight_schedule_id)
    cs = fs.charge_schedule

    #create the proper user reservation based on the flight matrix at a date 6 month in the past
    # see which days are allowed, then pick a random day, and take a day 1..28 weeks ago and create a user reservation
    days = fm.attributes.select{ |k,v| k =~ /day[1-7]/ && v == 1}.map{|x, y| day_index = x.match(/[1-7]/)[0].to_i }
    proposed_date = Date.today.sunday - rand(6..36).weeks + (days[rand(0..days.length-1)]).days

    #randomly create the review based on the reservation
    flight_count = rand(fs.min_pax..fs.max_pax)
    caddy_count = rand(fs.min_caddy..fs.max_caddy)
    buggy_count = rand(fs.min_cart..fs.max_cart)

    reservation = user.user_reservations.new(
      flight_matrix_id:fm.id, golf_club_id:fs.golf_club_id,
      status: 0,
      booking_date:proposed_date, booking_time: fm.tee_time,
      actual_caddy:caddy_count*cs.caddy , actual_buggy:buggy_count*cs.cart ,
      actual_pax:flight_count*cs.session_price, actual_insurance:flight_count*cs.insurance ,
      count_caddy:caddy_count, count_buggy:buggy_count, count_pax:flight_count , count_insurance:flight_count
    )

    #if successfully saved, create the review
    if reservation.save! then
      reservation.save!
      reservation.payment_confirmed!
      review = user.reviews.new(topic_id: reservation.id, topic_type:"UserReservation", rating:rand(1..5), comment:NameGenerator::LOREM)
      review.save!
      reservation
    else
      return nil
    end
  end

end
