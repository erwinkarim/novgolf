require 'test_helper'

class Admin::GolfClubsControllerTest < ActionController::TestCase
  # test "the truth" do
  #   assert true
  # end
  should use_before_action(:admins_only)

  #curd
  should route(:get, "admin/golf_clubs/1").to(action:"show", id:"1")
  should route(:patch, "admin/golf_clubs/1").to(action:"update", id:"1")
  should route(:get, "admin/golf_clubs/new").to(action:"new")
  should route(:post, "admin/golf_clubs").to(action:"create")
  should route(:delete, "admin/golf_clubs/1").to(action:"destroy", id:"1")

end
