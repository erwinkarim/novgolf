class GolfClub < ActiveRecord::Base
  require "assets/name_generator"

  has_many :charge_schedules, :dependent => :destroy
  has_many :user_reservations
  has_many :flight_schedules, :dependent => :destroy
  has_many :flight_matrices, :through => :flight_schedules
  has_many :amenity_lists, :dependent => :destroy
  has_many :amenities, :through => :amenity_lists
  has_many :photos, as: :imageable, :dependent => :destroy
  has_many :course_listings, :dependent => :destroy
  has_many :memberships

  has_one :course_global_setting, :dependent => :destroy

  belongs_to :user
  #should have has_many :reviews where topic_type = UserReservation
  # and topic_id = UserReservations.id and user_reservations.golf_club_id = id
  belongs_to :tax_schedule, optional:true

  enum flight_selection_method: [:flight_select_fuzzy, :flight_select_exact]

  validates_presence_of :name, :description, :address, :open_hour, :close_hour, :user_id, :tax_schedule_id, :flight_selection_method

  #should test that golf_club must have at least 1 course entry on update

  after_initialize :init
  after_save :enforce_club_policy

  def init
    # TODO: consider to skip this if method is not available because of ActiveRelation model is
    # punch out this model, but w/o all the attributes
    #auto create the default price schedule
    self.open_hour ||= Time.parse("2001-01-01 10:00 UTC")
    self.close_hour ||= Time.parse("2001-01-01 20:00 UTC")

    #default location is klcc
    self.lat ||= "3.15785"
    self.lng ||= "101.71165"

    self.tax_schedule_id ||= 1

  end

  #everytime the club is save / updated, club policy is enforced
  def enforce_club_policy
    # ensure that CourseGlobalSetting is there
    if self.course_global_setting.nil? then
      cgs = CourseGlobalSetting.new({golf_club_id:self.id})
      cgs.save!
    end

    # if the flight selection method is fuzzy, the course_user_selection is auto
    if !self.course_global_setting.nil? then
      if self.flight_select_fuzzy? && self.course_global_setting.user_manual_select? then
        self.course_global_setting.update_attribute(:user_selection, CourseGlobalSetting.user_selections[:user_auto_select])
      end
    end

    self.transaction do
    end

  end

  # ensure that if the flight_selection_method is fuzzy, the course_global_setting for user is auto
  def validate_course_global_setting

  end
  #shows how many many slots are available in this club
  # params queryDate date in string fromat
  def get_flight_matrix options = {}

      default_options = { :queryDateTime => DateTime.now, :spread => 30.minutes }
      options = default_options.merge(options)
      if options[:queryDateTime].class == "string" then
        queryDay = Date.parse(options[:queryDateTime]).cwday
      else
        queryDay = options[:queryDateTime].cwday
      end

      startHour = (options[:queryDateTime] - options[:spread]).strftime("%H:%M")
      endHour = (options[:queryDateTime] + options[:spread]).strftime("%H:%M")


      self.flight_matrices.where("day#{queryDay}".to_sym => 1, :tee_time => startHour..endHour)

  end

  #look for clus and give the tee_time at near
  #expected output [ {:club => {:id, :name, :link}, :tee_time => [..]}, { ... }]
  # TODO:
  # revamp the search, get the list of clubs that meet criteria and fill up w / other data based on criteria
  #     * skip clubs that is fully booked
  #     * load more tee times if the booking method is exact, otherwise, just take this first results that comes out
  # TODO: optional capture of course data, by default, just say how many is occupied vs #of courses and min status of the courses
  def self.search options = {}
    default_options = { :query => "", :dateTimeQuery => DateTime.parse("#{Date.tomorrow} 07:00"), :spread => 30.minutes,
      :pax => 8, :club_id => 0..10000000,
      :limit => 300, :offset => 0 , :adminMode => false, :loadCourseData => true, :forceExact => false}

    options = default_options.merge(options)

    query = options[:query]

    #get day of the week
    if options[:dateTimeQuery].class == String then
      queryDay = Date.parse(options[:dateTimeQuery]).cwday
    elsif options[:dateTimeQuery].class == Time
      queryDay = options[:dateTimeQuery].to_date.cwday
    else
      queryDay = options[:dateTimeQuery].cwday
    end

    #if looking from the past, skip
    if options[:dateTimeQuery] < DateTime.now && options[:adminMode] == false then
      return []
    end

    #set time range
    middleHour = Time.parse(options[:dateTimeQuery].strftime("%H:%M"))
    startHour = (options[:dateTimeQuery] - options[:spread]).strftime("%H:%M")
    endHour = (options[:dateTimeQuery] + options[:spread]).strftime("%H:%M")
    timeRange = startHour..endHour
    fuzzyPeriodName =
      (Time.parse("06:00")..Time.parse("11:00")).include?(middleHour) ? "Morning" :
      (Time.parse("11:01")..Time.parse("16:00")).include?(middleHour) ? "Afternoon" :
      "Evening"


    # todo: remove clubs that is fully booked in the time period
    #get current reservations, excluding failed/canceled attempts
    Rails.logger.info "queryDateTime = #{options[:dateTimeQuery]}"

    tr = UserReservation.where(:booking_date => options[:dateTimeQuery].to_date).where(:status => [0,1,2,3,8]).to_sql
    #load the data model
    rel = self.joining{
        flight_schedules.flight_matrices
      }.joining{ course_listings
      }.joining{ course_global_setting
      }.joins("left outer join (#{tr}) as tr on (flight_matrices.id = tr.flight_matrix_id and flight_matrices.tee_time = tr.booking_time and tr.course_listing_id = course_listings.id)").joining{
        flight_schedules.charge_schedule
      }.where.has{
        ( (name.like "%#{query}%") ) &
        (flight_schedules.flight_matrices.tee_time.in timeRange ) &
        (flight_schedules.min_pax <= options[:pax]) &
        (flight_schedules.flight_matrices.send("day#{queryDay}") == 1) &
        (flight_schedules.start_active_at <= options[:dateTimeQuery]) &
        (flight_schedules.end_active_at >= options[:dateTimeQuery]) &
        (flight_schedules.flight_matrices.start_active_at <= options[:dateTimeQuery]) &
        (flight_schedules.flight_matrices.end_active_at >= options[:dateTimeQuery]) &
        (id.in options[:club_id])
      }.limit(options[:limit])

    #round one: get details of the clubs that fit this criteria
    sql_statement = rel.selecting{[id,
      name, flight_selection_method
    ]}.distinct.to_sql

    results = ActiveRecord::Base.connection.exec_query(sql_statement).inject([]){ |p,n|
      p << {
        :club => { :tax_schedule => GolfClub.find(n["id"]).tax_schedule, :id => n["id"],
          :name => n["name"], :photos => GolfClub.find(n["id"]).photos.order(:sequence => :desc).limit(3).map{ |x| x.avatar.banner400.url},
          :course_user_selection =>  0, :flight_selection_method => n["flight_selection_method"]
        },
        :flights => []
      }
    }

    #in the future, round 2 and round 3 can be parallelize to improve performance
    #round two: fill up the flight schedule based on fuzzy criteria
      sql_statement = rel.selecting{[id,
        name, flight_schedules.charge_schedule.session_price,
        (flight_schedules.flight_matrices.id).as('fm_id'),
        (flight_schedules.flight_matrices.tee_time).as('tee_time'),
        flight_schedules.min_pax, #4
        flight_schedules.max_pax, flight_schedules.charge_schedule.cart, flight_schedules.charge_schedule.caddy, flight_schedules.charge_schedule.insurance,        #8
        flight_schedules.charge_schedule.note, flight_schedules.min_cart,  #12
        flight_schedules.max_cart, flight_schedules.min_caddy, flight_schedules.max_caddy, flight_schedules.charge_schedule.insurance_mode,  #16
        course_global_setting.user_selection
      ]}.distinct.where.has{ id.in results.select{ |x| x[:club][:flight_selection_method] == 0}.map{ |x| x[:club][:id]} }.to_sql

    ActiveRecord::Base.connection.exec_query(sql_statement).inject(results){ |p,n|
      club = p.select{ |x| x[:club][:id] == n["id"] }.first
      club[:flights] << {
        :minPax => n["min_pax"], :maxPax => n["max_pax"],
        :minCart => n["min_cart"], :maxCart => n["max_cart"],
        :minCaddy => n["min_caddy"], :maxCaddy => n["max_caddy"],
        :tee_time => n["tee_time"],
        :second_tee_time => fuzzyPeriodName,
        :matrix_id => n["fm_id"],
        :prices => { :flight => n["session_price"], :cart => n["cart"], :caddy => n["caddy"], :insurance => n["insurance"], :note => n["note"], :insurance_mode => n["insurance_mode"]},
        :course_data => { :status => 0, :courses => [] }
      }
      p
    }

    #round three: fill up the flihgt schedule based on exact criteria
    sql_statement = rel.group( " golf_clubs.id,
        golf_clubs.name, session_price, tee_time, second_tee_time, min_pax,
        max_pax, cart, caddy, insurance,
        flight_matrices.id, charge_schedules.note,
        min_cart, max_cart, min_caddy, max_caddy,
        insurance_mode, user_selection
      ").selecting{[id,
        name, flight_schedules.charge_schedule.session_price, flight_schedules.flight_matrices.tee_time, flight_schedules.flight_matrices.second_tee_time,
        flight_schedules.min_pax, #4
        flight_schedules.max_pax, flight_schedules.charge_schedule.cart, flight_schedules.charge_schedule.caddy, flight_schedules.charge_schedule.insurance,        #8
        flight_schedules.flight_matrices.id.as('fm_id'), 'min(tr.status) as tr_min_status', flight_schedules.charge_schedule.note, flight_schedules.min_cart,  #12
        flight_schedules.max_cart, flight_schedules.min_caddy, flight_schedules.max_caddy, flight_schedules.charge_schedule.insurance_mode,  #16
        course_global_setting.user_selection,
        'count(course_listings.id) as cl_count', 'count(tr.course_listing_id) as ur_cl_count'
        ]
      }.where.has{ id.in results.select{ |x| x[:club][:flight_selection_method] == 1}.map{ |x| x[:club][:id]} }.to_sql

      #shoud change this to exec_sql because it'd returns a hash instead of an array (cleaner code)
      #results = ActiveRecord::Base.connection.exec_query(sql_statement).inject([]){ |p,n|
      ActiveRecord::Base.connection.exec_query(sql_statement).inject(results){ |p,n|
        club = p.select{ |x| x[:club][:id] == n["id"] }.first
        if club.nil? then
          p << {
            :club => { :tax_schedule => GolfClub.find(n["id"]).tax_schedule, :id => n["id"],
              :name => n["name"], :photos => GolfClub.find(n["id"]).photos.order(:sequence => :desc).limit(3).map{ |x| x.avatar.banner400.url},
              :course_user_selection =>  n["user_selection"]
            },
            :flights => [ {
              :minPax => n["min_pax"], :maxPax => n["max_pax"],
              :minCart => n["min_cart"], :maxCart => n["max_cart"],
              :minCaddy => n["min_caddy"], :maxCaddy => n["max_caddy"],
              :tee_time => n["tee_time"].strftime("%H:%M"),
              :second_tee_time => n["second_tee_time"].nil? ? nil : n["second_tee_time"].strftime("%H:%M"),
              :matrix_id => n["fm_id"],
              :prices => { :flight => n["session_price"], :cart => n["cart"], :caddy => n["caddy"], :insurance => n["insurance"], :note => n["note"], :insurance_mode => n["insurance_mode"]},
              :course_data => { :status => n["ur_cl_count"].nil? || n["ur_cl_count"] < n["cl_count"] ? 0 : n["tr_min_status"] }
            }]
          }
        else
          # TODO: find the appropiate flights, add courses, or new flight if necessary
          club[:flights] << {
            :minPax => n["min_pax"], :maxPax => n["max_pax"],
            :minCart => n["min_cart"], :maxCart => n["max_cart"],
            :minCaddy => n["min_caddy"], :maxCaddy => n["max_caddy"],
            :tee_time => n["tee_time"].strftime("%H:%M"),
            :second_tee_time => n["second_tee_time"].nil? ? nil : n["second_tee_time"].strftime("%H:%M"),
            :matrix_id => n["fm_id"],
            :prices => { :flight => n["session_price"], :cart => n["cart"], :caddy => n["caddy"], :insurance => n["insurance"], :note => n["note"], :insurance_mode => n["insurance_mode"]},
            :course_data => { :status => n["ur_cl_count"].nil? || n["ur_cl_count"] < n["cl_count"] ? 0 : n["tr_min_status"] }
          }
          p
        end
      }

      #if more details course data require, go ask the database
      # applies only if the flight selection method is exact
      # TODO: put course data on 2nd tee time
      # TODO: add maintenance data
      if options[:loadCourseData] then
        course_query_statement = rel.selecting{ [id,
              flight_schedules.flight_matrices.id.as('fm_id'), course_listings.id.as('cl_id'), #2
              'tr.id as ur_id', 'tr.status as tr_status', course_listings.name.as('cl_name'), #5
              'tr.second_course_listing_id'
          ]}.where.has{ id.in results.select{ |x| x[:club][:flight_selection_method] == 1}.map{ |x| x[:club][:id]} }.to_sql
          course_results = ActiveRecord::Base.connection.exec_query(course_query_statement)
          course_results.inject(results){ |p,n|
            Rails.logger.info "current_row=#{n.inspect}"
            flight_handle = p.select{|x| x[:club][:id] == n["id"]}.first[:flights].select{|x| x[:matrix_id] == n["fm_id"]}.first
            if flight_handle[:course_data][:courses].nil? then
              flight_handle[:course_data][:courses] = []
            end
            flight_handle[:course_data][:courses] << {
              id:n["cl_id"], name:n["cl_name"],
                reservation_id:n["ur_id"], reservation_status:n["tr_status"],
                first_reservation_id:n["ur_id"], first_reservation_status:n["tr_status"],
                reservation_status_text: UserReservation.statuses.select{ |k,v| v == n["tr_status"]}.keys.first,
                second_reservation_id:nil, second_reservation_status:nil
            }
            p
          }
          course_results.inject(results){ |p,n|
            course_handle = p.select{|x| x[:club][:id] == n["id"]}.first[:flights].select{|x| x[:matrix_id] == n["fm_id"]}.
              first[:course_data][:courses].select{|x| x[:id] == n["second_course_listing_id"]}.first
            if !course_handle.nil? then
              course_handle[:second_reservation_id] = n["ur_id"]
              course_handle[:second_reservation_status] = n["tr_status"]
            end
            p
          }
          #find the 2nd course listing data

      end

      #add the query data on the first results only
      if results.empty? then
        results.push [{ :queryData => { :date => options[:dateTimeQuery].strftime('%d/%m/%Y'), :query => options[:query], :session => fuzzyPeriodName } }]
      else
        results[0] = results.first.merge(
          { :queryData => { :date => options[:dateTimeQuery].strftime('%d/%m/%Y'), :query => options[:query], :session => fuzzyPeriodName} }
        )
      end
      results

      #inject the photo path after search
  end

  #creates a new club in one shot
  # this function is suppose to be atomic
  # expected params :-
  # club_details => { :name, :description, :address, :open_hour, :close_hour}
  #   price_sch => { :random_id/current_id => {:price, :caddy, :buddy, :insurance} ... }
  #   flight_sch => { :random_id/current_id => {:times, :min_pax, :max_pax } ... }
  def self.generate club_details={}, price_sch={}, flight_sch ={}, flight_matrices={}
    self.transaction do
        club = GolfClub.new( :name => club_details[:name], :description => club_details[:description],
          :address => club_details[:address], :open_hour => club_details[:open_hour], :close_hour => club_details[:close_hour])
        club.save!

        #generate the flight schedule schedule
        #generate the charge schedule
        #generate the flight matrix
    end
  end

  #create a random golf club, for easy testing
  def self.generate_random_club owner = User.first
    #simple sanity check
    if owner.nil? then
      return
    end

    #create the club
    club_name = NameGenerator.random_name
    GolfClub.transaction do
      club = owner.golf_clubs.new(name:"Kelab #{club_name}", description:NameGenerator::LOREM * rand(2..10), address:club_name,
          lat:rand(2.87707..3.1979).to_s, lng:rand(101.4632..101.86152).to_s
      )
      club.save!

      #will always create 4 schedules, 1 morning weekday/weekend, and 1 afternoon weekday/weekend
      (1..4).each do |flight|
        #create the flight_schedules
        fs = club.flight_schedules.new(name:"FlightSchedule ##{flight}",
          min_pax:rand(2..4), max_pax:rand(4..6), min_cart:rand(0..1), max_cart:rand(2..4), min_caddy:rand(0..1), max_caddy:rand(2..4)
        )
        fs.save!

        #attach flight matrix
        tee_time = Time.parse("2001-01-01 #{flight.odd? ? "0#{rand(6..9)}:00" : "#{rand(14..16)}:00"} UTC")
        # 2nd tee time starts around 1.5 to 2.5 hours after the first
        second_tee_time = tee_time + ([2,2.5,3][rand(0..2)]).hours + rand(6..8).minutes

        #around 5 to 20 flights per session
        (5..rand(10..20)).each do |tee_off|
          fm = [1,2].include?(flight) ?
            fs.flight_matrices.new(day1:1, day2:1, day3:1, day4:1, day5:1, day6:0, day7:0, tee_time:tee_time, second_tee_time:second_tee_time) :
            fs.flight_matrices.new(day1:0, day2:0, day3:0, day4:0, day5:0, day6:1, day7:1, tee_time:tee_time, second_tee_time:second_tee_time)
          fm.save!
          interval = rand(6..8).minutes
          tee_time += interval
          second_tee_time += interval
        end

        #attach price schedule
        cs = ChargeSchedule.new(golf_club_id:club.id, flight_schedule_id:fs.id,
          caddy:rand(20..40), cart:rand(40..60), session_price:rand(100..1000), insurance:rand(20..50), insurance_mode:rand(0..2)
        )
        cs.save!
      end

      #generate courses
      club.generate_courses

      #create the ammenities
      Amenity.all.each do |amenity|
        if (rand(0.0..1.0).round == 1) then
          club.amenity_lists.new({amenity_id:amenity.id}).save!
        end
      end

      club
    end
  end

  #get a random club
  def self.random
    GolfClub.order("RAND()").first
  end

  #set the course listings
  # this function is usually called during update / create fn in admin/GolfClubsController
  def setCourseListing new_course_listings = []
    current_courses = self.course_listings

    self.transaction do
      #delete courses not in the new list
      CourseListing.where(:id => self.course_listings.map{|x| x.id} -
        new_course_listings.to_unsafe_h.map{ |k,v| v["id"].to_i}.select{ |x| !x.zero?}).each{ |x| x.destroy}

      #add new courses if applicable (the course id should be empty/null)
      # or update the current ones
      new_course_listings.each_pair do |i,e|
        if e[:id].nil? || e[:id].empty? then
          course = CourseListing.new(:golf_club_id => self.id, :name => e[:name], :course_status_id => e[:course_status_id])
          course.save!
        else
          course = CourseListing.find(e[:id])
          course.update_attributes({name:e[:name], course_status_id:e[:course_status_id]})
        end
      end
    end
  end

  #set the flight schedules, do validation, create new schedules if necessary
  # this should be the prefered method instead of using flight_schedule.new.save! and flight_matrix.new.save!
  # expected format:-
  # {
  #   "random_id" => {<info for flight_schedule include id}, {info for charge_schedule include id}, :days => [], :times => [] },
  #   "random_id" => {<info for flight_schedule include id}, {info for charge_schedule include id}, :days => [], :times => [] }
  # }
  #   "flight"=>{
  #     "a0e879"=>{"flight_id"=>"7", "charge_id"=>"5", "session_price"=>"90", "buggy"=>"100", "caddy"=>"0", "insurance"=>"10", "min_pax"=>"2",
  #     "max_pax"=>"4", "days" => ["1", "2", "3"], "times"=>["07:00", "07:07", "07:14"]}}, "id"=>"17"}
  def setFlightSchedule flight_schedules = {}
    #plan

    #validation
    fullSch = {}
    #setup the full flightSchedule
    #TODO:, push second_tee_time values for validation
    flight_schedules.each_pair do |i,e|
      e["times"].each_pair do |teeTimeKey, teeTimeValue|
        #setup the time pair
        std_time = Time.parse(teeTimeValue["tee_time"]).strftime("%H:%M")
        time_pair = { std_time => (0..7).inject([]){|p,n| p << 0} }
        e["days"].map{ |x| x.to_i }.each{ |x| time_pair.values.first[x] = 1 }

        #find the time pair in the current schedule, sum it up or merge
        selected_time = fullSch[std_time]
        if selected_time.nil? then
          fullSch = fullSch.merge(time_pair)
        else
          (0..selected_time.length-1).each{ |x| selected_time[x] += time_pair.values.first[x] }
        end
      end
    end

    #check the flight matrix for conflict
    conflict = !fullSch.select{ |k,v| !v.select{ |x| x > 1 }.empty? }.empty?
    if conflict  then
      raise Exception.new("Scheduling Conflict Detected")
    end

    #actual updating
    self.transaction do
      #delete flight schedules that don't exists anymore
      FlightSchedule.where(:id => (self.flight_schedules.map{|x| x.id } -
        flight_schedules.to_unsafe_h.map{ |k,v| v["flight_id"].to_i }.select{ |x| !x.zero? }) ).each do |y|
          y.setInactive
          #clean out if the fs is created and destroyed within 24 hours
          if(y.end_active_at - y.start_active_at < 24.hours) then
            DeleteFlightScheduleJob.perform_later(y.id)
          end
        end

      flight_schedules.each_pair do |idx, elm|
        if(elm["flight_id"].empty? ) then
          #create new flight_schedule
          fs = self.flight_schedules.new(:name => elm["name"],
            :min_pax => elm["min_pax"], :max_pax => elm["max_pax"],
            :min_cart => elm["min_cart"], :max_cart => elm["max_cart"],
            :min_caddy => elm["min_caddy"], :max_caddy => elm["max_caddy"],
            :start_active_at => DateTime.now )
          fs.save!

          #create new charge_schedule
          cs = ChargeSchedule.new()
          cs = ChargeSchedule.new(:golf_club_id => self.id, :flight_schedule_id => fs.id,
            :note => elm[:note],
            :session_price => elm[:session_price], :caddy => elm[:caddy], :insurance => elm[:insurance],
            :cart => elm[:cart], :insurance_mode => elm[:insurance_mode].to_i)
          cs.save!

          #create new flight_matrices
          elm["times"].each_pair do |fk, fv |
            fm = fs.flight_matrices.new(
              (1..7).inject({}){|p,n| p.merge({"day#{n}".to_sym => 0})}.merge(
                elm["days"].inject( {
                  :tee_time => Time.parse(fv["tee_time"]).strftime("%H:%M"),
                  :second_tee_time => Time.parse(fv["second_tee_time"]).strftime("%H:%M"),
                  :start_active_at => DateTime.now
                }){
                  |p,n| p.merge({ "day#{n}".to_sym => 1})
                }
              )
            )
            fm.save!
          end

        else
          #exisintg flight schedule and charge schedule
          #update the flight schedule
          current_flight = FlightSchedule.find(elm["flight_id"])
          current_flight.update_attributes({:name => elm["name"],
            :min_pax => elm["min_pax"], :max_pax => elm["max_pax"],
            :min_cart => elm["min_cart"], :max_cart => elm["max_cart"],
            :min_caddy => elm["min_caddy"], :max_caddy => elm["max_caddy"] })

          #update charge schedule
          elm["insurance"] = (elm["insurance"].nil?) ? 0 : elm["insurance"]
          cs = ChargeSchedule.find(elm["charge_id"])
          cs.update_attributes({:session_price => elm["session_price"], :cart => elm["buggy"],
            :note => elm["note"], :caddy => elm["caddy"], :insurance => elm["insurance"],
            :insurance_mode => elm["insurance_mode"].to_i })

          #remove flight matrices that does not exists anymore
          new_times = elm["times"].to_unsafe_h.map{|x| Time.parse("2000-01-01 #{x} +0000")}
          current_flight.flight_matrices.where.not(:tee_time => new_times).each{ |x| x.setInactive }

          #handle the flight matrices
          elm["times"].each_pair do |fk, fv |
            #check if this exists or not
            fm = current_flight.flight_matrices.where(:tee_time => Time.parse("2000-01-01 #{fv["tee_time"]} +0000")).first
            if fm.nil? then
              #fm not found in the current list, create new
              fm = current_flight.flight_matrices.new(
                elm["days"].inject({
                  :tee_time => fv["tee_time"],
                  :second_tee_time => fv["second_tee_time"],
                  start_active_at: DateTime.now
                }){|p,n| p.merge({ "day#{n}".to_sym => 1})
              })
              fm.save!
            else
              #fm found in current list, update the days
              fm.update_attributes(
                (1..7).inject({}){|p,n| p.merge({"day#{n}".to_sym => 0})}.merge(
                  elm["days"].inject({
                    :tee_time => fv["tee_time"],
                    :second_tee_time => fv["second_tee_time"]
                  }){|p,n| p.merge({ "day#{n}".to_sym => 1}) }
                )
              )

              #update end_active_at if reusing previously deleted flight_matrices
              if fm.end_active_at < DateTime.now then
                fm.update_attribute(:end_active_at, DateTime.parse("01-01-3017"))
              end
            end

          end #elm["times"].each ....
        end

      end
    end #self.transaction do ...
  end

  #get the complete amenity listing
  def amenity_listings
    am_sql = self.amenity_lists.to_sql

    Amenity.joins("left outer join (#{am_sql}) as am_sql on amenities.id = am_sql.amenity_id").pluck(
      :'amenities.id', :'amenities.name', :'amenities.label', :'amenities.icon', :'am_sql.amenity_id'
    ).map{ |x| { :amenity_id => x[0], :name => x[1], :label => x[2], :icon => x[3], :available => x[4].nil? ? false : true }}
  end

  #return reviews
  def reviews
    club_id = self.id
    Review.joining{ topic.of(UserReservation).golf_club}.where.has{ (topic.of(UserReservation).golf_club.id == club_id)}.order(:created_at => :desc)
  end

  # get rating stats for over 6 months ago
  def review_stats options = { :since => 6.months.ago }
  end

  #admin only: to auto generate 1-3 courses linked to the club if there's no courses
  def generate_courses
    if self.course_listings.empty? then
      (1..(rand(1..3))).each do |x|
        course = self.course_listings.new({ name:"Course ##{x}"})
        course.save!
      end
    end
    self.course_listings
  end

  #update the sequence number for the rest of the photos
  #args:
  # new_order photo_ids w/ new sequence number
  def update_photo_sequence new_order
    # if there's only 1 or 0 photos, ignore
    if self.photos.count == 0 || self.photos.count == 1 then
      return
    end

    self.transaction do
      current_sequence = 0
      new_order.each do |photo_id|
        photo = Photo.find(photo_id)
        if photo.sequence != current_sequence then
          photo.update_attribute(:sequence, current_sequence)
        end
        current_sequence += 1
      end
    end
  end

  #get active flight schedules
  def active_flight_schedules
    self.flight_schedules.where.has{end_active_at >= DateTime.now }
  end

  # proper way to delete
  def self_destruct
    # delete all ur invoice
    UrInvoice.where(:golf_club_id => self.id).destroy_all

    # delete user_reservations
    self.user_reservations.destroy_all

    # delete self
    self.destroy

  end

  def open_courses date = Date.today
    courses = []
    self.course_listings.inject([]){ |p,v| if v.isOpen? date then courses << v.id end }
    return courses
  end

  #get the next available reservation, based on data and given session
  # returns: an empty UR with the proper booking date and time based on date and session
  # to be added w/ other info like user_id, actual pricing, #, etc
  def next_available_slot date = Date.today, session = 'Morning'
    #link up get the available slots within time frame
    # something like search, but spit out slots available
  end

  # list down flight listing for the day
  # gives info like flight schedules, who's taking the info
  def getFlightListing date = Date.today, options = {}
    default_options = {timeOnly:false, loadCourseData:false}
    options = default_options.merge(options)

    tr = UserReservation.where(:booking_date => date).where(:status => [
      UserReservation.statuses[:reservation_created],
      UserReservation.statuses[:payment_attempted],
      UserReservation.statuses[:payment_confirmed],
      UserReservation.statuses[:reservation_confirmed],
      UserReservation.statuses[:requires_members_verification],
      UserReservation.statuses[:reservation_await_assignment],
      UserReservation.statuses[:operator_assigned],
      UserReservation.statuses[:operator_new_proposal]
    ]).to_sql
    now = DateTime.parse(date.to_s)
    queryDay = date.cwday
    club_id = self.id

    #load the data model
    rel = GolfClub.joining{
        flight_schedules.flight_matrices
      }.joining{ course_listings
      }.joining{ course_global_setting
      }.joins("left outer join (#{tr}) as tr on (flight_matrices.id = tr.flight_matrix_id and flight_matrices.tee_time = tr.booking_time and tr.course_listing_id = course_listings.id)").joining{
        flight_schedules.charge_schedule
      }.where.has{
        ( id.eq club_id ) &
        (flight_schedules.flight_matrices.send("day#{queryDay}") == 1) &
        (flight_schedules.start_active_at <= now) &
        (flight_schedules.end_active_at >= now) &
        (flight_schedules.flight_matrices.start_active_at <= now) &
        (flight_schedules.flight_matrices.end_active_at >= now)
      }

    sql_statement = rel.group( "
        session_price, tee_time, second_tee_time, min_pax,
        max_pax, cart, caddy, insurance,
        flight_matrices.id, charge_schedules.note,
        min_cart, max_cart, min_caddy, max_caddy,
        insurance_mode, user_selection
      ").selecting{[
        flight_schedules.flight_matrices.id.as('fm_id'),
        # pricing
        flight_schedules.charge_schedule.session_price, flight_schedules.charge_schedule.cart,
        flight_schedules.charge_schedule.caddy, flight_schedules.charge_schedule.insurance,
        #tee time
        flight_schedules.flight_matrices.tee_time, flight_schedules.flight_matrices.second_tee_time,
        #min/max + insurance mode
        flight_schedules.min_pax, flight_schedules.max_pax,
        flight_schedules.min_cart, flight_schedules.max_cart,
        flight_schedules.min_caddy, flight_schedules.max_caddy,
        flight_schedules.charge_schedule.insurance_mode,
        flight_schedules.charge_schedule.note,
        #user can select or not
        course_global_setting.user_selection,
        #reservation status
        'min(tr.status) as tr_min_status',
        #course count vs. reserved course count
        'count(course_listings.id) as cl_count', 'count(tr.course_listing_id) as ur_cl_count'
        ]
      }.distinct.ordering{flight_schedules.flight_matrices.tee_time}.to_sql

    results = ActiveRecord::Base.connection.exec_query(sql_statement).inject([]){ |p,n|
      p << {
        :minPax => n["min_pax"], :maxPax => n["max_pax"],
        :minCart => n["min_cart"], :maxCart => n["max_cart"],
        :minCaddy => n["min_caddy"], :maxCaddy => n["max_caddy"],
        :tee_time => options[:timeOnly] ? n["tee_time"].strftime('%H:%M') : n["tee_time"],
        :second_tee_time => n["second_tee_time"].nil? ? nil : options[:timeOnly] ? n["second_tee_time"].strftime("%H:%M") : n["second_tee_time"],
        :matrix_id => n["fm_id"],
        :prices => { :flight => n["session_price"], :cart => n["cart"], :caddy => n["caddy"], :insurance => n["insurance"], :note => n["note"], :insurance_mode => n["insurance_mode"]},
        :course_data => { :status => n["ur_cl_count"].nil? || n["ur_cl_count"] < n["cl_count"] ? 0 : n["tr_min_status"],
          :cl_count => n["cl_count"], :ur_cl_count => n["ur_cl_count"]}
      }
    }

    #load the course data if you have to
    if(options[:loadCourseData]) then
      course_query_statement = rel.selecting{ [
            flight_schedules.flight_matrices.id.as('fm_id'), course_listings.id.as('cl_id'), #2
            'tr.id as ur_id', 'tr.status as tr_status', course_listings.name.as('cl_name'), #5
            'tr.second_course_listing_id'
      ]}.where.has{ id.eq club_id }.to_sql
      Rails.logger.info "sql_statement = #{course_query_statement}"
      course_results = ActiveRecord::Base.connection.exec_query(course_query_statement)
      course_results.inject(results){ |p,n|
        Rails.logger.info "current_row=#{n.inspect}"
        flight_handle = p.select{|x| x[:matrix_id] == n["fm_id"]}.first
        if flight_handle[:course_data][:courses].nil? then
          flight_handle[:course_data][:courses] = []
        end
        flight_handle[:course_data][:courses] << {
          id:n["cl_id"], name:n["cl_name"],
            reservation_id:n["ur_id"], reservation_status:n["tr_status"],
            first_reservation_id:n["ur_id"], first_reservation_status:n["tr_status"],
            reservation_status_text: UserReservation.statuses.select{ |k,v| v == n["tr_status"]}.keys.first,
            second_reservation_id:nil, second_reservation_status:nil
        }
        p
      }
      course_results.inject(results){ |p,n|
        course_handle = p.select{|x| x[:matrix_id] == n["fm_id"]}.
          first[:course_data][:courses].select{|x| x[:id] == n["second_course_listing_id"]}.first
        if !course_handle.nil? then
          course_handle[:second_reservation_id] = n["ur_id"]
          course_handle[:second_reservation_status] = n["tr_status"]
        end
        p
      }
    end

    results
  end
end
