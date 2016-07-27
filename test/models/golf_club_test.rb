require 'test_helper'

class GolfClubTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end

  #validation tests
  test "golf_club must have name, address and description" do
    assert_raise(ActiveRecord::RecordInvalid){ GolfClub.new.save! }
  end

  test "golf_club must be owned by someone" do
    gc = GolfClub.new(:name => "test_name", :description => "about test", :address => "123, example road")
    assert_not gc.valid?
  end

  test "search exists" do
    assert_respond_to GolfClub, :search
  end

  test "setFlightSchedule exists in instance" do
      assert_respond_to GolfClub.first, :setFlightSchedule
  end

  test "amenity_listings exists instance" do
    assert_respond_to GolfClub.first, :amenity_listings
  end


  #search result must be empty if looking for dates in the past
  test "search must the empty if looking in the past" do
    query = GolfClub.search(:dateTimeQuery => Time.parse("2001-01-01 07:00 +0000"))
    assert_empty query, "search should be empty if looking in the past"
  end
end
