require 'test_helper'

class UrInvoiceTest < ActiveSupport::TestCase
  should belong_to :invoice
  should belong_to :user_reservation
  # test "the truth" do
  #   assert true
  # end
end
