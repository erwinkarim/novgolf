require 'test_helper'

class UserReservationsControllerTest < ActionController::TestCase
  # test "the truth" do
  #   assert true
  # end
  should route(:post, "/golf_clubs/1/user_reservations/reserve").to(action:"reserve", golf_club_id:"1")
  should route(:post, "/golf_clubs/1/user_reservations/processing").to(action:"processing", golf_club_id:"1")
  should route(:post, "/golf_clubs/1/user_reservations/confirmation").to(action:"confirmation", golf_club_id:"1")
  should route(:get, "/golf_clubs/1/user_reservations/failure").to(action:"failure", golf_club_id:"1")
  should route(:get, "/golf_clubs/1/user_reservations").to(action:"index", golf_club_id:"1")
end
