require 'test_helper'

class GolfClubsControllerTest < ActionController::TestCase
  # test "the truth" do
  #   assert true
  # end
  should route(:get, "golf_clubs/1").to(action:"show", id:"1")

  #this have been moved to /clubbers
  #should route(:get, "golf_clubs/join").to(action:"join")

end
