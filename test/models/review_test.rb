require 'test_helper'

class ReviewTest < ActiveSupport::TestCase
  should validate_presence_of(:user_id)
  should validate_presence_of(:topic_type)
  should validate_presence_of(:topic_id)
  should validate_presence_of(:comment)
  #should validate presence of rating if topic_type is user_reservation

  should belong_to(:user)
  should belong_to(:topic)

  test "rating can't be blank if topic is UserReservation" do
    review = User.first.reviews.new({:topic_type => "UserReservation", :topic_id => 1, :comment => "test"})
    assert_raise ActiveRecord::RecordInvalid do
      review.save!
    end
  end
end
