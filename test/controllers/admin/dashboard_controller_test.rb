require 'test_helper'

class Admin::DashboardControllerTest < ActionController::TestCase
  # test "the truth" do
  #   assert true
  # end
  should use_before_action(:superadmins_only)
end
