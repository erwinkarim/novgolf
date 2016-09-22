require 'test_helper'

class LineItemListingTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  should validate_presence_of(:rate)
  should validate_presence_of(:taxed)
  should validate_presence_of(:charge_schedule_id)
  should validate_presence_of(:line_item_id)

  should belong_to(:line_item)
  should belong_to(:charge_schedule)
end
