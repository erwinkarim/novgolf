require 'test_helper'

class WelcomeControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers
  should route(:get, "/").to(action:"index")
  should route(:get, "/search").to(action:"search")

  #this has been moved to pages gem
  #should route(:get, "/terms").to(action:"terms")

  test "should get index" do
    get :index
    assert_response :success
  end

=begin
  test "should get search" do
    get :search
    assert_response :success
  end
=end
end
