require 'test_helper'

class BillingCycleTest < ActiveSupport::TestCase
  should belong_to :user
  should validate_uniqueness_of :user_id
  # test "the truth" do
  #   assert true
  # end
end
