require 'test_helper'

class ReviewsControllerTest < ActionController::TestCase
  # test "the truth" do
  #   assert true
  # end

  #think about the review should be generated
  should route(:get, "/users/1/reviews/new").to(action: :new, user_id:"1")
  should route(:get, "/users/1/reviews/1/edit").to(action: :edit, user_id:"1", id:"1")
  should route(:get, "/users/1/reviews/1").to(action: :show, user_id:"1", id:"1")
  should route(:delete, "/users/1/reviews/1").to(action: :destroy, user_id:"1", id:"1")

  #show club reviews
  should route(:get, "/golf_clubs/1/reviews").to(action: :club_reviews, golf_club_id:"1")
end
