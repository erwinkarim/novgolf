class AddCourseGlobalSettingsToExistingClubs < ActiveRecord::Migration[5.1]
  def up
    GolfClub.all.each do |club|
      cgs = CourseGlobalSetting.new({golf_club_id:club.id})
      cgs.save!
    end
  end

  def down
    CourseGlobalSetting.destroy_all
  end
end
