require 'test_helper'

class CourseSettingPropertyTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  should validate_presence_of(:label)
  should validate_presence_of(:desc)
  should validate_presence_of(:expected_type)
end
