require 'test_helper'

class CourseListingTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  should validate_presence_of(:golf_club_id)
  should validate_presence_of(:name)
  should validate_presence_of(:course_status_id)

  should belong_to(:golf_club)
  should belong_to(:course_status)
end
