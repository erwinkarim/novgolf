require 'test_helper'

class FlightScheduleTest < ActiveSupport::TestCase
  should validate_presence_of(:golf_club_id)
  should validate_presence_of(:min_pax)
  should validate_presence_of(:min_cart)
  should validate_presence_of(:min_caddy)
  should validate_presence_of(:max_pax)
  should validate_presence_of(:max_cart)
  should validate_presence_of(:max_caddy)
  should validate_presence_of(:start_active_at)
  should validate_presence_of(:end_active_at)

  should have_many(:flight_matrices)
  should have_one(:charge_schedule)

  # 0 <= min_caddy <= max_caddy
  should validate_numericality_of(:min_caddy).only_integer.is_greater_than_or_equal_to(0)
  should validate_numericality_of(:max_caddy).only_integer.is_greater_than_or_equal_to(0)

  # 0 <= min_cart <= max_cart
  should validate_numericality_of(:min_cart).only_integer.is_greater_than_or_equal_to(0)
  should validate_numericality_of(:max_cart).only_integer.is_greater_than_or_equal_to(0)

  # 2 <= min_pax <= max_pax
  should validate_numericality_of(:min_pax).only_integer.is_greater_than_or_equal_to(2)
  should validate_numericality_of(:max_pax).only_integer.is_greater_than_or_equal_to(2)

end
