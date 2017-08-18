class AddFieldsToCourseGlobalSetting < ActiveRecord::Migration[5.1]
  def change
    add_reference :course_global_settings, :golf_club, type: :integer, index: true, foreign_key: true

    add_column :course_global_settings, :admin_selection, :integer, default: 0
    add_column :course_global_settings, :user_selection, :integer, default: 0
  end
end
