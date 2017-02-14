require 'test_helper'

class UserTest < ActiveSupport::TestCase
  should validate_presence_of(:email)
  should validate_presence_of(:role)
  should validate_presence_of(:image_path)
  should validate_uniqueness_of(:email)

  should have_many(:user_reservations)
  should have_many(:golf_clubs)
  should have_many(:photos)
  should have_one(:profile_picture)
  should have_many(:reviews)
  should have_many(:memberships)

  # test "the truth" do
  #   assert true
  # end

  test "set_memberships_fn" do
    assert_respond_to User.new, :set_memberships
  end

end
