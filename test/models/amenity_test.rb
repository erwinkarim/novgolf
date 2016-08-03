require 'test_helper'

class AmenityTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  should validate_presence_of(:name)
  should validate_presence_of(:label)
  should validate_uniqueness_of(:name)
end
