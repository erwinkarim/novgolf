class Review < ActiveRecord::Base
  include Rails.application.routes.url_helpers

  belongs_to :user
  belongs_to :topic, polymorphic: true
  #belongs_to :user_reservation, foreign_key: "topic", optional: true, polymorphic: true

  validates_presence_of :user_id, :topic_id, :topic_type, :comment
  validates_presence_of :rating, if: :topic_is_user_reservation

  validates_inclusion_of :topic_type, in: ["UserReservation", "GolfClub"]

  #should have rating if topic_type is UserReservation
  def topic_is_user_reservation
    topic_type == "UserReservation"
  end

  #shows the user resevation if the topic is user_reservation
  def user_reservation
    if topic_type == "UserReservation" then
      self.topic
    else
      nil
    end
  end

  def to_json
    topic = eval(self.topic_type).find(self.topic_id)
    case self.topic_type
    when "UserReservation"
      topic = topic.attributes.merge({
        golf_club:topic.golf_club,
        booking_datetime:"#{topic.booking_date.to_datetime.strftime('%d-%b-%Y')}@#{topic.booking_time.strftime('%l:%M%p')}",
        link:golf_club_path(topic.golf_club),
        image:topic.golf_club.photos.empty? ? nil : topic.golf_club.photos.last.avatar.square400.url
      })
    else
      topic
    end

    self.attributes.merge({
      user:self.user.attributes.merge({
          link:user_path(self.user)
      }),
      topic:topic,
      created_at:self.created_at.localtime.strftime('%d/%b/%Y %H:%I%p')
      })
  end

end
