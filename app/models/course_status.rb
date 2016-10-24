class CourseStatus < ActiveRecord::Base
  validates_presence_of(:desc, :available)
end
