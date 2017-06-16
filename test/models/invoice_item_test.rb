require 'test_helper'

class InvoiceItemTest < ActiveSupport::TestCase
  should belong_to(:invoice)
  should validate_presence_of(:invoice_id)
  should validate_presence_of(:charges)
  should validate_presence_of(:invoice_item_category_id)

  should belong_to(:invoice_item_category)
  # test "the truth" do
  #   assert true
  # end
end
