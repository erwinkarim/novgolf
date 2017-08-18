class CourseSetting < ApplicationRecord
  belongs_to :course_listing
  belongs_to :course_setting_property

  validates_presence_of :course_listing_id
  validates_presence_of :value_type
  validates_presence_of :course_setting_property_id

  enum value_type: [:integer, :string, :range]
end
