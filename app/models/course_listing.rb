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
        course_setting.assign_attributes({course_setting_property_id:e[:course_setting_property_id]})
      end

      #assign based on value type
      case e[:value_type]
      when "string"
        #if nth day of the month, change it to json
        if e[:course_setting_property_id].to_i == 3 then
          e[:value_string] = e[:value_string].to_json
        end
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

  # check if the course is open on the selected date
  def isOpen? date = Date.today
    #no settings, by default it's open
    if self.course_settings.empty? then
      return true
    end

    # convert the rules to the schedule
    schedule = IceCube::Schedule.new
    self.course_settings.each do |cs|
      case cs.course_setting_property_id
      when 2
        # day of the month
        schedule.add_recurrence_rule(
          IceCube::Rule.weekly.day_of_month(cs.value_int)
        )
      when 3
        # Nth day of the month, value_string should be a json of {week:x, day:y}
        occurance = JSON.parse cs.value_string
        schedule.add_recurrence_rule(
          IceCube::Rule.monthly.day_of_week(occurance["day"].to_i => [occurance["week"].to_i])
        )
      when 4
        # specific date range
        # if it's in the date range then return true
        dateRange = Date.new(cs.value_min)..Date.new(cs.value_max)
        if dateRange.include? date then
          return true
        end
      else
        # default day of of the week
        schedule.add_recurrence_rule(
          IceCube::Rule.weekly.day(cs.value_int)
        )
      end
    end

    return !schedule.occurs_on?(date)

  end
end
