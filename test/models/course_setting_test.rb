require 'test_helper'

class CourseSettingTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  should belong_to(:course_listing)
  should belong_to(:course_setting_property)

  should validate_presence_of(:course_setting_property_id)
  should validate_presence_of(:value_type)
  should validate_presence_of(:course_listing_id)
end
