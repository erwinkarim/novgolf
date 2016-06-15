class GolfClub < ActiveRecord::Base
  has_many :charge_schedules
  has_many :user_reservations
  has_many :flight_schedules
  has_many :flight_matrices, :through => :flight_schedules

  belongs_to :user

  validates_presence_of :name, :description, :address, :open_hour, :close_hour

  after_initialize :init

  def init
    #auto create the default price schedule
    self.open_hour ||= 10
    self.close_hour ||= 20
  end

  #return the current and latest price schedule
  def latest_charge_schedule
      return self.charge_schedules.last
  end

  #gives how full reservations is being made for the next 7 days
  def reservations_count
    #get max amount of reservations available
    hours = self.close_hour - self.open_hour
    price_schedule = self.latest_price_schedule
    max_reservations = hours * price_schedule.sessions_per_hour * price_schedule.slots_per_session * 7

    #get current count
    current_reservations = self.user_reservations.where(:booking_datetime => DateTime.now..(DateTime.now+7.days)).count

    return current_reservations.to_f / max_reservations
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
  def self.search options = {}
    default_options = { :query => "", :dateTimeQuery => Time.now, :spread => 30.minutes, :pax => 2, :club_id => 0..10000000 }

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
          charge_schedules
      }.where{
        # this doesn't really work
        ( (name.like "%#{query}%") | (description.like "%#{query}%")) &
        (flight_matrices.tee_time.in timeRange ) &
        (flight_schedules.min_pax.lte options[:pax]) &
        (id.in options[:club_id])
      }.limit(30
      ).pluck(:id, :name, :session_price, :tee_time, :min_pax, :max_pax, :cart, :caddy, :insurance,
        :'flight_matrices.id', :'tr.booking_time', :'tr.status'
      ).inject([]){ |p,n|
        club = p.select{ |x| x[:club][:id] == n[0] }.first
        booked_time = n[10].nil? ? nil : n[10].strftime("%H:%M")
        if club.nil? then
          p << {
            :club => { :id => n[0], :name => n[1]},
            :tee_times => [ {:tee_time => n[3].strftime("%H:%M"), :booked => booked_time, :matrix_id => n[9], :reserve_status => n[11] }],
            :flight => { :minPax => n[4], :maxPax => n[5], :matrix_id => n[9], :date => options[:dateTimeQuery].strftime('%d/%m/%Y')},
            :prices => { :flight => n[2], :cart => n[6], :caddy => n[7], :insurance => n[8]}
          }
        else
          club[:tee_times] << { :tee_time => n[3].strftime("%H:%M"), :booked => booked_time, :matrix_id => n[9], :reserve_status => n[11] }
          p
        end
      }
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

  #create a new flight scedule
  def createFlightSchedule flight_sch={}, charge_sch={}, flight_days=[], flight_matrices=[]
    self.transaction do
      fs = self.flight_schedules.new(flight_sch)
      fs.save!

      cs = ChargeSchedule.new()
      cs = ChargeSchedule.new(:golf_club_id => self.id, :flight_schedule_id => fs.id,
        :session_price => charge_sch[:session_price], :caddy => charge_sch[:caddy], :insurance => charge_sch[:insurance],
        :cart => charge_sch[:cart])
      cs.save!

      #need to fix this later
      flight_matrices.each do |flight_time|
        fm = fs.flight_matrices.new(flight_days.inject({:tee_time => flight_time}){|p,n| p.merge({ "day#{n}".to_sym => 1}) })
        fm.save!
      end
    end
  end
end
