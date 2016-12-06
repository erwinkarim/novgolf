class UserReservation < ActiveRecord::Base
  # TODO: lock changes in count and actual 24 hours after the booking date and time
  require "assets/name_generator"

  belongs_to :user
  belongs_to :charge_schedule
  belongs_to :golf_club
  belongs_to :flight_matrix
  belongs_to :course_listing

  has_one :review, as: :topic
  has_many :ur_member_details, dependent: :destroy

  #each club id should have a unique booking date and time
  #  and unique course #
  # TODO:and the course# should be less than than # of courses in the club
  validates :golf_club_id, uniqueness: {
    scope: [:booking_date, :booking_time, :course_listing_id],
    #validation will be enforced during creation, payment and confirmation stage, but not when it was canceled or failed
    # or when status is requires_members_verification
    conditions: -> { where( status: [0,1,2,3,8])}
  }
  #validates :token, uniqueness: true
  #need to check when this feature is available
  validates_presence_of :user_id, :flight_matrix_id
  validates_presence_of :actual_pax, :actual_buggy, :actual_caddy, :actual_insurance, :actual_tax
  validates_presence_of :count_pax, :count_buggy, :count_caddy, :count_insurance, :count_member
  validates_presence_of :booking_date, :booking_time, :course_listing_id
  validates_presence_of :status
  validate :validates_booking_datetime, on: :create

  has_secure_token

  enum status: [:reservation_created, :payment_attempted, :payment_confirmed,
    :reservation_confirmed, :canceled_by_club, :canceled_by_user, :payment_failed, :reservation_failed, :requires_members_verification]

  after_initialize :init

  def init
    self.status ||= 0
    self.count_member ||= 0
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

  #update the counts if things change and update the pricing as well
  # expected format for flightInfo { count_pax:, }
  def update_counts flight_info = {}
    self.transaction do
      #update count
      self.update_attributes({ count_pax:flight_info[:pax], count_buggy:flight_info[:buggy],
        count_member:flight_info[:member],
        count_caddy:flight_info[:caddy], count_insurance:flight_info[:insurance]})

      #update member info, if there's members
      #delete members that are not in the list anymore
      if flight_info.has_key? :members then
        UrMemberDetail.where(:id => self.ur_member_details.map{|x| x.id} - flight_info[:members].map{|x| x[1]["id"].to_i}).each{ |x| x.destroy }
        # cycle through the members, update/create info and delete if there are not there
        flight_info[:members].each_pair do |k,member|
          if member["id"].empty? then
            new_member = self.ur_member_details.new({member_id:member["member_id"], name:member["name"]})
            new_member.save!
          else
            ur_member_detail = UrMemberDetail.find(member["id"])
            ur_member_detail.update_attributes({member_id:member["member_id"], name:member["name"]})
          end
        end
      end

      #update the pricing
      self.update_pricing
    end
  end

  #update the pricing in case the values are changing.
  def update_pricing

    cs = self.flight_matrix.flight_schedule.charge_schedule

    self.transaction do
      taxation = (self.count_pax * cs.session_price + self.count_caddy * cs.caddy +
        self.count_buggy * cs.cart + self.count_insurance * cs.insurance) * self.golf_club.tax_schedule.rate
      self.assign_attributes({
        actual_pax: self.count_pax * cs.session_price, actual_caddy: self.count_caddy * cs.caddy, actual_buggy: self.count_buggy * cs.cart,
        actual_insurance: self.count_insurance * cs.insurance, actual_tax:taxation
      })
      self.save!
    end

  end

  #streamline method to generate user reservation
  #includes the sanity checks, etc...
  # flight_info must be format {:pax, :caddy, :buggy, :insurance}, ie- count, everything else will be calculated
  def self.create_reservation flight_matrix_id, user_id, booked_date = Date.today, flight_info = {}
    #sanity checks, expects that flight_info has all the necessary keys and values
    flight_info = flight_info.symbolize_keys

    # get the flight matrix
    #get the charge schedule based on flight_matrix_id
    # => will get the associated golf club
    # => will get the associated booking time
    # get the current pricing at this time
    fm = FlightMatrix.find(flight_matrix_id)
    cs = ChargeSchedule.where(:flight_schedule_id => fm.flight_schedule_id ).first
    club = GolfClub.find(cs.golf_club_id)
    club_id = cs.golf_club_id
    booking_date_clause = booked_date.class == String ? (Date.parse(booked_date).strftime("%Y-%m-%d")) : booked_date.strftime("%Y-%m-%d")
    booking_time_clause = fm.tee_time

    # create the new user_reservation, with the correct flight_info and cost calculation
    ur = UserReservation.new
    self.transaction do
      taxation = (flight_info[:pax].to_i * cs.session_price + flight_info[:caddy].to_i * cs.caddy +
          flight_info[:buggy].to_i * cs.cart + flight_info[:insurance].to_i * cs.insurance) * club.tax_schedule.rate
      ur = UserReservation.new(
        user_id:user_id, golf_club_id: cs.golf_club_id, flight_matrix_id:fm.id,
        booking_date: booking_date_clause, booking_time: booking_time_clause,
        count_pax:flight_info[:pax], count_caddy:flight_info[:caddy], count_buggy: flight_info[:buggy] , count_insurance:flight_info[:insurance],
          count_member:flight_info[:member],
        actual_pax:flight_info[:pax].to_i * cs.session_price, actual_caddy: flight_info[:caddy].to_i * cs.caddy,
          actual_buggy:flight_info[:buggy].to_i * cs.cart, actual_insurance: flight_info[:insurance].to_i * cs.insurance,
          actual_tax: taxation,
        status:0
      )

      #find the free coursetime
      first_course_id = (club.course_listings.map{ |x| x.id } -
        UserReservation.where{ (golf_club_id.eq club_id) & (booking_date.eq booking_date_clause) &
          (booking_time.eq booking_time_clause) & (status.not_in [4,5,6])
        }.map{|x| x.course_listing_id }).first
      ur.assign_attributes({course_listing_id:first_course_id})
      Rails.logger.info "new course id = #{first_course_id}"

      ur.save!
      ur.reservation_created!
    end
    ur
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
    taxation = (caddy_count*cs.caddy + buggy_count*cs.cart + flight_count*cs.session_price + flight_count*cs.insurance).to_f * club.tax_schedule.rate
    #get first course
    course_id = club.course_listings.first.id

    reservation = user.user_reservations.new(
      flight_matrix_id:fm.id, golf_club_id:fs.golf_club_id,
      status: 0,
      booking_date:proposed_date, booking_time: fm.tee_time,
      actual_caddy:caddy_count*cs.caddy , actual_buggy:buggy_count*cs.cart ,
      actual_pax:flight_count*cs.session_price, actual_insurance:flight_count*cs.insurance ,
      actual_tax:taxation,
      course_listing_id: course_id,
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
