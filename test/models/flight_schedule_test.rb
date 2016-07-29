require 'test_helper'

class FlightScheduleTest < ActiveSupport::TestCase
  should validate_presence_of(:golf_club_id)
  should validate_presence_of(:min_pax)
  should validate_presence_of(:min_cart)
  should validate_presence_of(:min_caddy)
  should validate_presence_of(:max_pax)
  should validate_presence_of(:max_cart)
  should validate_presence_of(:max_caddy)

end
