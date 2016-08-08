class Review < ActiveRecord::Base
  belongs_to :user
  belongs_to :topic, polymorphic: true
  belongs_to :user_reservation, ->(o){where "reviews.topic_type = ?", "UserReservation"}, foreign_key: :topic_id

  validates_presence_of :user_id, :topic_id, :topic_type, :comment
  validates_presence_of :rating, if: :topic_is_user_reservation

  #should have rating if topic_type is UserReservation

  def topic_is_user_reservation
    topic_type == "UserReservation"
  end

end
