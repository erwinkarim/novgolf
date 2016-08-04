class GolfClub < ActiveRecord::Base
  has_many :charge_schedules, :dependent => :destroy
  has_many :user_reservations
  has_many :flight_schedules, :dependent => :destroy
  has_many :flight_matrices, :through => :flight_schedules
  has_many :amenity_lists, :dependent => :destroy
  has_many :amenities, :through => :amenity_lists
  has_many :photos, as: :imageable

  belongs_to :user
  #should have has_many :reviews where topic_type = UserReservation
  # and topic_id = UserReservations.id and user_reservations.golf_club_id = id


  validates_presence_of :name, :description, :address, :open_hour, :close_hour, :user_id

  after_initialize :init

  def init
    #auto create the default price schedule
    self.open_hour ||= 10
    self.close_hour ||= 20

    #default location is klcc
    self.lat ||= "3.15785"
    self.lng ||= "101.71165"
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
            :club => { :id => n[0], :name => n[1], :photos => GolfClub.find(n[0]).photos.order(:created_at => :desc).limit(3).map{ |x| x.avatar.banner400.url} },
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
end
