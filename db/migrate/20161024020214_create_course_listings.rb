class CreateCourseListings < ActiveRecord::Migration[5.1]
  def change
    create_table :course_listings do |t|
      t.references :golf_club, index: true, foreign_key: true
      t.text :name, limit:160
      t.references :course_status, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
