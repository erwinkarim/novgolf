require 'test_helper'

class CourseStatusTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  should validate_presence_of(:desc)
  should validate_presence_of(:available)
end
