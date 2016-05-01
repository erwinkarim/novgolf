class GolfClub < ActiveRecord::Base
  has_many :charge_schedules
  has_many :user_reservations
  has_many :flight_schedules

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

  #creates a new club in one shot
  # this function is suppose to be atomic
  # expected params :-
  # club_details => { :name, :description, :address, :open_hour, :close_hour}
  #   price_sch => { :random_id/current_id => {:price, :caddy, :buddy, :insurance} ... }
  #   flight_sch => { :random_id/current_id => {:times, :min_pax, :max_pax } ... }
  def self.generate club_details={}, price_sch={}, flight_sch ={}
    self.transaction do
        club = GolfClub.new( :name => club_details[:name], :description => club_details[:description],
          :address => club_details[:address], :open_hour => club_details[:open_hour], :close_hour => club_details[:close_hour])
        if club.save! then
          #start saving the price scheudle
          price_sch.each do |pc|
            club.charge_schedules.new(
              :session_price => pc[:price], :buggy => pc[:buggy], :caddy => pc[:caddy], :insurance => pc[:insurance]
            )
          end

          #start saving the flight scheudle
          flight_sch.each do |fc|
            flightSch = club.flight_schedules.new(:min_pax => fc[:min_pax], :max_pax => fc[:max_pax])
            if flightSch.save! then
                #generate the flight schedule matrix
            end
          end
        end
    end
  end
end
