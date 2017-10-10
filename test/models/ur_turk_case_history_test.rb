require 'test_helper'

class UrTurkCaseHistoryTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  should belong_to :ur_turk_case
  should belong_to :user
end
