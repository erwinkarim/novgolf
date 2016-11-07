class CourseListing < ActiveRecord::Base
  validates_presence_of(:name, :course_status_id, :golf_club_id)

  belongs_to :golf_club
  belongs_to :course_status

  after_initialize :init

  def init
    self.name ||= "Course Name"
    self.course_status_id ||= 1
  end
end
