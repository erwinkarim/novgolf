require 'test_helper'

class UserReservationTest < ActiveSupport::TestCase
  should validate_presence_of(:user_id)
  should validate_presence_of(:actual_pax)
  should validate_presence_of(:actual_caddy)
  should validate_presence_of(:actual_buggy)
  should validate_presence_of(:actual_insurance)
  should validate_presence_of(:count_pax)
  should validate_presence_of(:count_caddy)
  should validate_presence_of(:count_buggy)
  should validate_presence_of(:count_insurance)
  should validate_presence_of(:count_member)
  should validate_presence_of(:booking_date)
  should validate_presence_of(:booking_time)
  should validate_presence_of(:course_listing_id)
  should validate_presence_of(:status)
  should validate_presence_of(:actual_tax)


  should belong_to(:user)
  should belong_to(:golf_club)
  should belong_to(:charge_schedule)
  should belong_to(:course_listing)

  should have_one(:review)

  should have_many(:ur_member_details).dependent(:destroy)
  should have_many(:ur_transactions).dependent(:destroy)

  #ensure the validates_booking_datetime returns true if put correct input
  test "validates_booking_datetime true" do
    fm = FlightMatrix.last
    selected_day = fm.attributes.select{|k,v| k.match(/day[1-7]/) && v == 1 }.first[0].match(/[1-7]/)[0].to_i
    selected_date = 3.weeks.ago.sunday + selected_day.days
    selected_time = fm.tee_time

    assert UserReservation.new(booking_date:selected_date, booking_time:selected_time, flight_matrix_id:fm.id).validates_booking_datetime
  end

  #ensure the validates_booking_datetime returns false if put wrong input
  test "validates_booking_datetime false" do
    fm = FlightMatrix.last
    selected_day = fm.attributes.select{|k,v| k.match(/day[1-7]/) && (v == 0 || v.nil?) }.first[0].match(/[1-7]/)[0].to_i
    selected_date = 3.weeks.ago.sunday + selected_day.days
    selected_time = fm.tee_time

    assert_not UserReservation.new(booking_date:selected_date, booking_time:selected_time, flight_matrix_id:fm.id).validates_booking_datetime
  end


end
