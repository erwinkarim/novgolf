class AddCourseSettingPropertyToCourseSetting < ActiveRecord::Migration[5.1]
  def change
    add_reference :course_settings, :course_setting_property, foreign_key: true
  end
end
