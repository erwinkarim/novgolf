require 'test_helper'

class FlightMatrixTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  test "must associated with flight_schedule" do
      fm = FlightMatrix.new
      assert_not fm.valid?

      fm = FlightSchedule.last.flight_matrices.new
      assert fm.valid?
  end

  test "must at least 1 of days populated raise an error if do" do
      fm = FlightSchedule.last.flight_matrices.new
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
