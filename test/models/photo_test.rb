require 'test_helper'

class PhotoTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  should validate_presence_of(:user_id)
  should validate_presence_of :imageable_type
  should validate_presence_of :imageable_id

end
