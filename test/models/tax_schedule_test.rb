require 'test_helper'

class TaxScheduleTest < ActiveSupport::TestCase
  should have_many(:charge_schedules)
  # test "the truth" do
  #   assert true
  # end
end
