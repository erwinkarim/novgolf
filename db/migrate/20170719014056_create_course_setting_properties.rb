class CreateCourseSettingProperties < ActiveRecord::Migration[5.1]
  def change
    create_table :course_setting_properties do |t|
      t.string :label, limit: 160
      t.string :desc
      t.integer :expected_type

      t.timestamps
    end
  end
end
