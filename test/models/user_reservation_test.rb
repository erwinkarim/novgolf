require 'test_helper'

class UserReservationTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  #valid is assocaited with user, have all the actual_x and count_x fields populated and booking_date and time
  test "must be valid" do
      ur = UserReservation.new
      assert_not ur.valid?

      ur.assign_attributes({:user_id => User.last.id })
      assert_not ur.valid?

      ur.assign_attributes({:actual_pax => 90.00, :actual_caddy => 10.00, :actual_buggy => 20.00, :actual_insurance => 0.00})
      assert_not ur.valid?

      ur.assign_attributes({:count_pax => 1, :count_caddy => 2, :count_buggy => 3, :count_insurance => 1})
      assert_not ur.valid?

      ur.assign_attributes({:booking_date => DateTime.now.to_date + 1.day, :booking_time => Time.parse("2001-01-01 08:00 +0000")})
      assert ur.valid?
  end

  test "user cannot be nil" do
    ur = UserReservation.last
    assert_not ur.update_attribute(:user_id, nil)
  end
end
