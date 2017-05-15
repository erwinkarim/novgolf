require 'test_helper'

class FlightMatrixTest < ActiveSupport::TestCase
  should validate_presence_of(:flight_schedule_id)
  should validate_presence_of(:tee_time)

  should have_many(:user_reservations)
  should belong_to(:flight_schedule)

  test "must at least 1 of days populated raise an error if do" do
      fm = FlightSchedule.last.flight_matrices.new
      fm.assign_attributes({day1:nil, day2:nil, day3:nil, day4:nil, day5:nil})
      assert_raise(ActiveRecord::RecordInvalid){ fm.save! }

      fm = FlightSchedule.last.flight_matrices.new( {:day0 => 1})
      assert fm.save!
  end

  test "must have tee time automatically populated" do
    fm = FlightSchedule.last.flight_matrices.new({ :day0 => 1})
    fm.save!
    assert_not_nil fm.tee_time
  end

end
