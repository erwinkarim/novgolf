require 'test_helper'

class AmenityListTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  validate_presence_of(:golf_club_id)
  validate_presence_of(:amenity_id)
end
