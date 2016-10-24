class CreateCourseStatuses < ActiveRecord::Migration
  def change
    create_table :course_statuses do |t|
      t.text :desc, limit:160
      t.boolean :available

      t.timestamps null: false
    end
  end
end
