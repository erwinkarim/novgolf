require 'test_helper'

class AmenitiesControllerTest < ActionController::TestCase
  # should only the index and in json format
  should route(:get, "amenities").to(action:"index")
end
