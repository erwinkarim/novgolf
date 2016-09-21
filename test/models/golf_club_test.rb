require 'test_helper'

class GolfClubTest < ActiveSupport::TestCase
  should validate_presence_of(:name)
  should validate_presence_of(:description)
  should validate_presence_of(:address)
  should validate_presence_of(:user_id)
  should validate_presence_of(:tax_schedule_id)
  # test "the truth" do
  #   assert true
  # end

  should have_many(:charge_schedules)
  should have_many(:user_reservations)
  should have_many(:flight_schedules)
  should have_many(:photos)
  should have_many(:amenities)
  should have_many(:amenity_lists)

  should belong_to(:user)
  should belong_to(:tax_schedule)


  test "search exists" do
    assert_respond_to GolfClub, :search
  end

  test "setFlightSchedule exists in instance" do
      assert_respond_to GolfClub.first, :setFlightSchedule
  end

  test "amenity_listings exists instance" do
    assert_respond_to GolfClub.first, :amenity_listings
  end

  test "reviews exists in instance" do
    assert_respond_to GolfClub.first, :reviews
  end


  #search result must be empty if looking for dates in the past
  test "search must the empty if looking in the past" do
    query = GolfClub.search(:dateTimeQuery => Time.parse("2001-01-01 07:00 +0000"))
    assert_empty query, "search should be empty if looking in the past"
  end

  test "search must have results if looking into the future with correct time" do
    query = GolfClub.search({:dateTimeQuery => Time.parse(DateTime.now.next_week.to_date.to_s + " 08:00 +0000")} )
    assert_not_empty query
  end

  test "search must have zero results if looking into the future with wrong time" do
    query = GolfClub.search({:dateTimeQuery => Time.parse(DateTime.now.next_week.to_date.to_s + " 00:00 +0000")} )
    assert_empty query
  end
end
