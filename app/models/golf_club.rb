class GolfClub < ActiveRecord::Base
  require "assets/name_generator"

  has_many :charge_schedules, :dependent => :destroy
  has_many :user_reservations
  has_many :flight_schedules, :dependent => :destroy
  has_many :flight_matrices, :through => :flight_schedules
  has_many :amenity_lists, :dependent => :destroy
  has_many :amenities, :through => :amenity_lists
  has_many :photos, as: :imageable
  has_many :course_listings

  belongs_to :user
  #should have has_many :reviews where topic_type = UserReservation
  # and topic_id = UserReservations.id and user_reservations.golf_club_id = id
  belongs_to :tax_schedule


  validates_presence_of :name, :description, :address, :open_hour, :close_hour, :user_id, :tax_schedule_id

  #should test that golf_club must have at least 1 course entry on update

  after_initialize :init

  def init
    #auto create the default price schedule
    self.open_hour ||= Time.parse("2001-01-01 10:00 UTC")
    self.close_hour ||= Time.parse("2001-01-01 20:00 UTC")

    #default location is klcc
    self.lat ||= "3.15785"
    self.lng ||= "101.71165"

    self.tax_schedule_id ||= 1
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
  # to do:
  # 1. remove clubs that is fully booked
  # 2. club ranking algothrim
  # 3. don't return results if looking for something in the past??
  # TODO: better way to display since each flight times can bring diffrent prices
  def self.search options = {}
    default_options = { :query => "", :dateTimeQuery => Time.now, :spread => 30.minutes, :pax => 8, :club_id => 0..10000000 }

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
    if options[:dateTimeQuery] < DateTime.now then
      return []
    end

    #set time range
    startHour = (options[:dateTimeQuery] - options[:spread]).strftime("%H:%M")
    endHour = (options[:dateTimeQuery] + options[:spread]).strftime("%H:%M")
    timeRange = startHour..endHour

    # todo: remove clubs that is fully booked in the time period
    #get current reservations, excluding failed/canceled attempts
    tr = UserReservation.where(:booking_date => options[:dateTimeQuery].to_date).where.not(:status => [4,5,6]).to_sql
    self.joins{
        flight_schedules.flight_matrices
      }.joins("left outer join (#{tr}) as tr on (flight_matrices.id = tr.flight_matrix_id and flight_matrices.tee_time = tr.booking_time)").joins{
        flight_schedules.charge_schedule
      }.where{
        ( (name.like "%#{query}%") ) &
        (flight_matrices.tee_time.in timeRange ) &
        (flight_schedules.min_pax.lte options[:pax]) &
        (flight_matrices.send("day#{queryDay}").eq 1) &
        (id.in options[:club_id])
      }.limit(30
      ).pluck(:id, :name, :session_price, :tee_time, :min_pax, :max_pax, :cart, :caddy, :insurance,
        :'flight_matrices.id', :'tr.booking_time', :'tr.status', :'charge_schedules.note',
        :min_cart, :max_cart, :min_caddy, :max_caddy, :insurance_mode, :'tr.id'
      ).inject([]){ |p,n|
        club = p.select{ |x| x[:club][:id] == n[0] }.first
        booked_time = n[10].nil? ? nil : n[10].strftime("%H:%M")
        if club.nil? then
          p << {
            :club => { :tax_schedule => GolfClub.find(n[0]).tax_schedule, :id => n[0], :name => n[1], :photos => GolfClub.find(n[0]).photos.order(:created_at => :desc).limit(3).map{ |x| x.avatar.banner400.url} },
            :flights => [ {
                :minPax => n[4], :maxPax => n[5],
                :minCart => n[13], :maxCart => n[14],
                :minCaddy => n[15], :maxCaddy => n[16],
                :tee_time => n[3].strftime("%H:%M"), :booked => booked_time, :matrix_id => n[9], :reserve_status => n[11],
                :user_reservation_id => n[18],
                :prices => { :flight => n[2], :cart => n[6], :caddy => n[7], :insurance => n[8], :note => n[12], :insurance_mode => n[17]}
            }],
            :queryData => { :date => options[:dateTimeQuery].strftime('%d/%m/%Y'), :query => options[:query]}
          }
        else
          club[:flights] << {
            :minPax => n[4], :maxPax => n[5],
            :minCart => n[13], :maxCart => n[14],
            :minCaddy => n[15], :maxCaddy => n[16],
            :tee_time => n[3].strftime("%H:%M"), :booked => booked_time, :matrix_id => n[9], :reserve_status => n[11] ,
            :user_reservation_id => n[18],
            :prices => { :flight => n[2], :cart => n[6], :caddy => n[7], :insurance => n[8], :note => n[12], :insurance_mode => n[17]}
          }
          p
        end
      }

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

        #around 5 to 20 flights per session
        (5..rand(10..20)).each do |tee_off|
          fm = [1,2].include?(flight) ?
            fs.flight_matrices.new(day1:1, day2:1, day3:1, day4:1, day5:1, day6:0, day7:0, tee_time:tee_time) :
            fs.flight_matrices.new(day1:0, day2:0, day3:0, day4:0, day5:0, day6:1, day7:1, tee_time:tee_time)
          fm.save!
          tee_time += rand(7..14).minutes
        end

        #attach price schedule
        cs = ChargeSchedule.new(golf_club_id:club.id, flight_schedule_id:fs.id,
          caddy:rand(20..40), cart:rand(40..60), session_price:rand(100..1000), insurance:rand(20..50), insurance_mode:rand(0..2)
        )
        cs.save!
      end

      #create the ammenities
    end
  end

  #set the course listings
  def setCourseListing new_course_listings = []
    current_courses = self.course_listings

    self.transaction do
      #delete courses not in the new list
      CourseListing.where(:id => self.course_listings.map{|x| x.id} -
        new_course_listings.map{ |k,v| v["id"].to_i}.select{ |x| !x.zero?}).each{ |x| x.destroy}

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
    flight_schedules.each_pair do |i,e|
      e["times"].each do |teeTime|
        #setup the time pair
        std_time = Time.parse(teeTime).strftime("%H:%M")
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
        flight_schedules.map{ |k,v| v["flight_id"].to_i }.select{ |x| !x.zero? }) ).each{|y| y.destroy }

      flight_schedules.each_pair do |idx, elm|
        puts "updating the flight schedules"
        if(elm["flight_id"].empty? ) then
          #create new flight_schedule
          fs = self.flight_schedules.new(:name => elm["name"],
            :min_pax => elm["min_pax"], :max_pax => elm["max_pax"],
            :min_cart => elm["min_cart"], :max_cart => elm["max_cart"],
            :min_caddy => elm["min_caddy"], :max_caddy => elm["max_caddy"] )
          fs.save!

          #create new charge_schedule
          cs = ChargeSchedule.new()
          cs = ChargeSchedule.new(:golf_club_id => self.id, :flight_schedule_id => fs.id,
            :note => elm[:note],
            :session_price => elm[:session_price], :caddy => elm[:caddy], :insurance => elm[:insurance],
            :cart => elm[:cart], :insurance_mode => elm[:insurance_mode].to_i)
          cs.save!

          #need to fix this later <- why?
          #create new flight_matrices
          elm["times"].each do |flight_time|
            fm = fs.flight_matrices.new(
              elm["days"].inject( {:tee_time => Time.parse(flight_time).strftime("%H:%M")} ){
                |p,n| p.merge({ "day#{n}".to_sym => 1})
              }
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
          new_times = elm["times"].map{|x| Time.parse("2000-01-01 #{x} +0000")}
          current_flight.flight_matrices.where.not(:tee_time => new_times).each{ |x| x.destroy }

          #handle the flight matrices
          elm["times"].each do |flight_time|
            #check if this exists or not
            fm = current_flight.flight_matrices.where(:tee_time => Time.parse("2000-01-01 #{flight_time} +0000")).first
            if fm.nil? then
              #create new
              fm = current_flight.flight_matrices.new(
                elm["days"].inject({:tee_time => flight_time}){|p,n| p.merge({ "day#{n}".to_sym => 1}) }
              )
              fm.save!
            else
              #update the days / what not
              fm.update_attributes(
                (1..7).inject({}){|p,n| p.merge({"day#{n}".to_sym => 0})}.merge(
                  elm["days"].inject({:tee_time => flight_time}){|p,n| p.merge({ "day#{n}".to_sym => 1}) }
                )
              )
            end
          end
        end

      end
    end

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
    Review.joins{ user_reservation.golf_club }.where(:'user_reservations.golf_club_id' => self.id).order(:created_at => :desc)
  end

  # get rating stats for over 6 months ago
  def review_stats options = { :since => 6.months.ago }
  end
end
