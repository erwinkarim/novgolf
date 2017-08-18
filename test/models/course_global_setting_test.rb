require 'test_helper'

class CourseGlobalSettingTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  should belong_to(:golf_club)
  should validate_uniqueness_of(:golf_club_id)
  should validate_presence_of(:admin_selection)
  should validate_presence_of(:user_selection)
end
