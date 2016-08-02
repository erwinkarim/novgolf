require 'test_helper'

class Admin::PhotosControllerTest < ActionController::TestCase
  # test "the truth" do
  #   assert true
  # end
  should use_before_action(:admins_only)
end
