require 'test_helper'

class UrTurkCaseTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  should belong_to :user_reservation
  should belong_to :user

  should have_many :ur_turk_case_histories
  should validate_presence_of(:user_reservation_id)
  should validate_presence_of(:user_id)
end
