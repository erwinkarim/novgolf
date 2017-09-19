class CourseGlobalSetting < ApplicationRecord
  belongs_to :golf_club

  enum admin_selection: [:admin_auto_select, :admin_manual_select]
  enum user_selection: [:user_auto_select, :user_manual_select]

  validates_uniqueness_of :golf_club_id
  validates_presence_of :admin_selection, :user_selection

  #enforce that if the golf club flight selection is fuzzy, the user_selecton must be auto_select
end
