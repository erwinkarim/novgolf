class CourseListing < ActiveRecord::Base
  validates_presence_of(:name, :course_status_id, :golf_club_id)

  belongs_to :golf_club
  belongs_to :course_status

  has_many :course_settings

  after_initialize :init

  def init
    self.name ||= "Course Name"
    self.course_status_id ||= 1
  end

  def setCourseSettings new_course_settings={}
    Rails.logger.info "new_course_settings= #{new_course_settings.inspect}"
    #compare the current list with the new list
    currentSettings = self.course_settings

    #remove settings that are not in the new list
    CourseSetting.where(:id => self.course_settings.map{ |x| x.id} -
      new_course_settings.map{ |e| e["id"].to_i}.select{ |x| !x.zero? }
    ).each{ |x| x.destroy }

    new_course_settings.each do |e|
      #update settings that are in the new list
      course_setting = nil
      if e[:id].nil? || e[:id].empty? then
        course_setting = self.course_settings.new({ course_setting_property_id:e[:course_setting_property_id]})
      else
        course_setting = CourseSetting.find(e[:id])
      end

      #assign based on value type
      case e[:value_type]
      when "string"
        course_setting.assign_attributes({value_type:CourseSetting.value_types[:string], value_string:e[:value_string]})
      when "range"
        course_setting.assign_attributes({value_type:CourseSetting.value_types[:range],
          value_min:e[:value_min], value_max:e[:value_max]})
      else
        #defaults to int
        course_setting.assign_attributes({value_type:CourseSetting.value_types[:integer], value_int:e[:value_int]})
      end

      course_setting.save!
    end
  end
end
