class CourseListing < ActiveRecord::Base
  belongs_to :golf_club
  belongs_to :course_status
end
