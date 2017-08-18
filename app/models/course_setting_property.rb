class CourseSettingProperty < ApplicationRecord
  validates_presence_of :label, :desc, :expected_type
  enum expected_type: [:integer, :string, :range]
end
