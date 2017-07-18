class CourseSetting < ApplicationRecord
  belongs_to :course_listing

  validates_presence_of :course_listing_id
  validates_presence_of :property
  validates_presence_of :value_type

  enum value_type: [:integer, :string, :range]
end
