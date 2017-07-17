class CreateCourseGlobalSettings < ActiveRecord::Migration[5.1]
  def change
    create_table :course_global_settings do |t|

      t.timestamps
    end
  end
end
