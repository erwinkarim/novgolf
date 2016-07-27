require 'test_helper'

class ChargeScheduleTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end

  test "must associated with a flight_schedule and golf_club" do
    cs = ChargeSchedule.new
    assert_not cs.valid?

    cs = GolfClub.last.charge_schedules.new
    asset_not cs.valid?

    cs = GolfClub.last.charge_schedules.new({:flight_schedule_id => GolfClub.last.flight_schedules.last.id})
    assert cs.valid?
  end

  test "must have prices and insurance_mode populated with default values" do
    cs = ChargeSchedule.new(:flight_schedule_id => FlightSchedule.last.id)
    cs.save!

    assert_not_nil cs.session_price
    assert_not_nil cs.caddy
    assert_not_nil cs.cart
    assert_not_nil cs.insurance
    assert_not_nil cs.insurance_mode
  end

  test "prices and insurance_mode cannot be nil" do
    cs = ChargeSchedule.new(:flight_schedule_id => FlightSchedule.last.id)
    cs.save!

    cs.update_attributes({ :session_price => nil, :caddy => nil, :cart => nil, :insurance => nil, :insurance_mode => nil})
    assert_not_nil cs.session_price
    assert_not_nil cs.caddy
    assert_not_nil cs.cart
    assert_not_nil cs.insurance
    assert_not_nil cs.insurance_mode
  end
end
