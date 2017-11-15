class CreateCourseSettings < ActiveRecord::Migration[5.1]
  def change
    create_table :course_settings do |t|
      t.references :course_listing, type: :bigint, foreign_key: true
      t.string :value_type
      t.integer :value_int
      t.string :value_string
      t.string :value_min
      t.string :value_max

      t.timestamps
    end
  end
end
