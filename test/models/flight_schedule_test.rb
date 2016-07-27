require 'test_helper'

class FlightScheduleTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  test "must be associated with golf club" do
    fs = FlightSchedule.new
    assert_not fs.valid?

    fs = GolfClub.first.flght_schedules.new
    assert fs.valid?
  end

  test "must have min/max pax, cart and caddy values" do
      fs = GolfClub.first.flight_schedules.new
      fs.save!
      assert_not_nil fs.min_pax
      assert_not_nil fs.min_cart
      assert_not_nil fs.min_caddy

      assert_not_nil fs.max_pax
      assert_not_nil fs.max_cart
      assert_not_nil fs.max_caddy
  end

end
