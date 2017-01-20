require 'test_helper'
class UrTransactionTest < ActiveSupport::TestCase
  should belong_to(:user_reservation)

  should validate_presence_of(:user_reservation_id)
  should validate_presence_of(:trans_amount)
  should validate_presence_of(:detail_type)

  # test "the truth" do
  #   assert true
  # end

end
