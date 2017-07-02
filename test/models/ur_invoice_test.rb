require 'test_helper'

class UrInvoiceTest < ActiveSupport::TestCase
  should belong_to :invoice
  should belong_to :user_reservation
  should validate_presence_of(:final_total)
  should validate_presence_of(:billing_category)
  should validate_presence_of(:invoice_id)
  should validate_presence_of(:user_reservation_id)
  should validate_presence_of(:golf_club_id)
  # test "the truth" do
  #   assert true
  # end
end
