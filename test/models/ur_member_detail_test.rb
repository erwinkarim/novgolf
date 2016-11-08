require 'test_helper'

class UrMemberDetailTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  should validate_presence_of(:name)
  should validate_presence_of(:member_id)

  should belong_to(:user_reservation)
  
end
