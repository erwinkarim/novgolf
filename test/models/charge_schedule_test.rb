require 'test_helper'

class ChargeScheduleTest < ActiveSupport::TestCase
  should validate_presence_of(:flight_schedule_id)
  should validate_presence_of(:golf_club_id)
  should validate_presence_of(:session_price)
  should validate_presence_of(:caddy)
  should validate_presence_of(:cart)
  should validate_presence_of(:insurance)
  should validate_presence_of(:insurance_mode)

  should belong_to(:golf_club)
  should belong_to(:flight_schedule)

end
