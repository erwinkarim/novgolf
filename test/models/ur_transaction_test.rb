require 'test_helper'
class UrTransactionTest < ActiveSupport::TestCase
  should belong_to(:user_reservation)
  # test "the truth" do
  #   assert true
  # end
end
