require 'test_helper'

class InvoiceItemTest < ActiveSupport::TestCase
  should belong_to(:invoice)
  should belong_to(:invoice_item_category)
  
  should validate_presence_of(:invoice_id)
  should validate_presence_of(:charges)
  should validate_presence_of(:invoice_item_category_id)
  # test "the truth" do
  #   assert true
  # end
end
