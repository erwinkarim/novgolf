require 'test_helper'

class LineItemTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  should validate_presence_of(:name)
  should validate_presence_of(:description)

  should have_many(:line_item_listings)
end
