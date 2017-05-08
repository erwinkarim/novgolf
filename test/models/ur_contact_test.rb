require 'test_helper'

class UrContactTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  should validate_presence_of(:user_id)
  should validate_presence_of(:name)

  should belong_to(:user)

  #email & tel is optional
end
