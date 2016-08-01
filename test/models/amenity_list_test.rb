require 'test_helper'

class AmenityListTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  validate_presence_of(:golf_club_id)
  validate_presence_of(:amenity_id)
  validate_uniqueness_of(:amenity_id).scoped_to(:golf_club_id)

  should belong_to(:golf_club)
  should belong_to(:amenity)

end
