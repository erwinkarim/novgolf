require 'test_helper'

class InvoiceItemTest < ActiveSupport::TestCase
  should belong_to(:invoice)
  should validate_presence_of(:invoice_id)
  should validate_presence_of(:charges)
  # test "the truth" do
  #   assert true
  # end
end
