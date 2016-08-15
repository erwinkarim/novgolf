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
  should validate_presence_of(:booking_date)
  should validate_presence_of(:booking_time)
  should validate_presence_of(:status)

  should belong_to(:user)
  should belong_to(:golf_club)
  should belong_to(:charge_schedule)

  should have_one(:review)

end
