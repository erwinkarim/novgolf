require 'test_helper'

class MembershipTest < ActiveSupport::TestCase
  should validate_presence_of(:user_id)
  should validate_presence_of(:expires_at)

  should belong_to(:golf_club)
  should belong_to(:user)

  test "club_name exists" do
    assert_respond_to Membership.first, :club_name
  end

  test 'golf_club_xor_alt_club_name' do
    membership = Membership.new(user_id:1, expires_at:Date.today)
    #should fail
    assert_not membership.valid?
  end
end
