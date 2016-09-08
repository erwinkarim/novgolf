require 'test_helper'

class UsersControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers
  
  #curd
  should route(:get, "users/1").to(action:"show", id:"1")
  should route(:get, "users/1/edit").to(action:"edit", id:"1")
  should route(:patch, "users/1").to(action:"update", id:"1")
end
