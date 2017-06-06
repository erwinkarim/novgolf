require 'test_helper'

class InvoiceTest < ActiveSupport::TestCase
  should belong_to :user
  should have_many :ur_invoices
  # test "the truth" do
  #   assert true
  # end
end
