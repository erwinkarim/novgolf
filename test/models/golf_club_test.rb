require 'test_helper'

class GolfClubTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end

  test "search exists" do
    assert_respond_to GolfClub, :search
  end

  test "setFlightSchedule exists in instance" do
      assert_respond_to GolfClub.first, :setFlightSchedule
  end

  test "amenity_listings exists instance" do
    assert_respond_to GolfClub.first, :amenity_listings
  end
end
