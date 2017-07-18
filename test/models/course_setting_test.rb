require 'test_helper'

class CourseSettingTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  should belong_to(:course_listing)
  
  should validate_presence_of(:property)
  should validate_presence_of(:value_type)
  should validate_presence_of(:course_listing_id)
end
