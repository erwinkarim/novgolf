class Review < ActiveRecord::Base
  belongs_to :user
  belongs_to :topic, polymorphic: true
  belongs_to :user_reservation, ->(o){where "reviews.topic_type = ?", "UserReservation"}, foreign_key: :topic_id

  validates_presence_of :user_id, :topic_id, :topic_type, :comment

end
