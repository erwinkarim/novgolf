class Admin::GolfClubsController < ApplicationController
  #require login
  before_action :authenticate_user!

  def index
    @golf_clubs = current_user.golf_clubs
  end

  # GET      /admin/golf_clubs/:id(.:format)
  def show
    #ensure that you can actually view this
    @golf_club = GolfClub.find(params[:id])

    if current_user.id == @golf_club.user_id then
      respond_to do |format|
        format.html
        format.json
      end
    else
      render :file => "public/401.html", :code => :unauthorized
    end
  end

  # GET      /admin/golf_clubs/:golf_club_id/dashboard
  def dashboard
    @golf_club = GolfClub.find(params[:golf_club_id])

    if current_user.id == @golf_club.user_id then
      respond_to do |format|
        format.html
        format.json
      end
    else
      render :file => "public/401.html", :code => :unauthorized
    end
  end

  # GET      /admin/golf_clubs/:id/edit(.:format)
  def edit
    @golf_club = GolfClub.find(params[:id])
    @flight_schedules = @golf_club.flight_schedules.map do |fs|
      (fs.attributes.merge("charge_schedule" => fs.charge_schedule.attributes)).
      merge("flight_matrices" => fs.flight_matrices.map{|x| x.attributes})
    end
    @dummy = (FlightSchedule.new.attributes.merge("charge_schedule" => ChargeSchedule.new.attributes)).
      merge("flight_matrices" => [FlightMatrix.new.attributes])
  end

  # GET      /admin/golf_clubs/new
  def new
    @golf_club = GolfClub.new
    #need to merge w/ default
    @flight_schedules = [
      (FlightSchedule.new.attributes.merge("charge_schedule" => ChargeSchedule.new.attributes)).
      merge("flight_matrices" => [FlightMatrix.new.attributes])
    ]

  end

  # POST     /admin/golf_clubs(.:format)
  # sample params
  # {"authenticity_token"=>"0Rx3otKfHHv45imY3i+bpVgxVSXwBlKjfue4myJn+0YYXSpd+LiJltjyxZBQ2hDk/p09Yorpy+Q4kfJdi9WSBA==",
  #   "golf_club"=>{"name"=>"", "description"=>"", "address"=>"", "open_hour"=>"10:00am", "close_hour"=>"8:00pm"},
  #   "flight"=>{
  #     "5d6783"=>{"flight_id"=>"", "charge_id"=>"", "session_price"=>"", "buggy"=>"", "caddy"=>"", "insurance"=>"", "min_pax"=>"2",
  #       "max_pax"=>"4", "days" => [1,2,3], times"=>["07:00", "07:07", "07:14"]},
  #     "64f5ff"=>{"flight_id"=>"", "charge_id"=>"", "session_price"=>"", "buggy"=>"", "caddy"=>"", "insurance"=>"", "min_pax"=>"2",
  #       "max_pax"=>"4", "days" => [1,2,3], "times"=>["07:00", "07:07", "07:14"]}},
  #   "amm"=>{"shops"=>"on", "changing_room"=>"on", "lounge"=>"on"}}
  def create
    #create all the prototypes
    #golf_club = GolfClub.new(golf_club_params)
    golf_club = current_user.golf_clubs.new(golf_club_params)

    Rails.logger.info @golf_club.inspect

    if golf_club.valid? then
        golf_club.transaction do
          golf_club.save!

          params[:flight].each do |flight|
            #fs = golf_club.flight_schedules.new(:min_pax => flight["min_pax"].to_i, :max_pax => flight["max_pax"].to_i)
            golf_club.createFlightSchedule(
              {:min_pax => flight[1][:min_pax], :max_pax => flight[1][:max_pax]},
              {:session_price => flight[1]["session_price"], :caddy => flight[1]["caddy"],
                :insurance => flight[1]["insurance"], :cart => flight[1]["buggy"]},
              flight[1][:days],
              flight[1][:times]
            )
          end
        end

        #everything ok, redirect_to the site
        respond_to do |format|
          format.html{
              redirect_to admin_golf_club_path(golf_club), :status => :created
          }
          format.json{
            render json:{ :path => {:admin => admin_golf_club_path(golf_club)}, :user => golf_club_path(golf_club) }
          }
        end
    else
      respond_to do |format|
        format.html {
          redirect_to :back, :status => :not_acceptable
        }
        format.json {
          render json:{:errors => { :golf_club => golf_club.errors.messages} }, :status => :not_acceptable
        }
      end
    end
  end

  # PATCH    /admin/golf_clubs/:id(.:format)
  # PUT      /admin/golf_clubs/:id(.:format)
  # sample params
  # {"authenticity_token"=>"41IMHDpAVZtuQ23vSXj79dUcw07XFWsYzxB01b8PHZ0qE1HjEGfAdk5XgefHjXC0c7CrCa368l+JZj4TFr103w==",
  #   "golf_club"=>{"name"=>"...", "description"=>"...", "address"=>"...", "open_hour"=>"...", "close_hour"=>"..."},
  #   "flight"=>{
  #     "a0e879"=>{"flight_id"=>"7", "charge_id"=>"5", "session_price"=>"90", "buggy"=>"100", "caddy"=>"0", "insurance"=>"10", "min_pax"=>"2",
  #     "max_pax"=>"4", "times"=>["07:00", "07:07", "07:14"]}}, "id"=>"17"}
  def update
    #plan
    # find the golf club
    # create a transaction
    # update the club
    # =>  update the flight schedules
    #   => update the charge schedule associated with the flight schedules
    #   => update the flight matrices assocaited with the flight schedules

    gc = GolfClub.find(params[:id])

    gc.transaction do
      gc.update_attributes(golf_club_params)

      #process the new list, delete the ones are not in the new list
      Rails.logger.info "Prunning flight schedules from the golf club"
      Rails.logger.info "params[:flight].map = #{params[:flight].map{|x| x[1]["flight_id"]}.select{ |x| !x.empty? } }"
      FlightSchedule.where(:id => (gc.flight_schedules.map{|x| x.id } -
        params[:flight].map{ |x| x[1]["flight_id"].to_i }.select{ |x| !x.zero? }) ).each{|y| y.destroy }

      #update the new list
      params[:flight].each do |flight|
        #determine if this is an existing or new flight

        if (!flight[1]["flight_id"].empty?) then
          #if existing, do ammendents
          Rails.logger.info "Updating existing flight #{flight[1][:flight_id]}"
          current_flight = FlightSchedule.find(flight[1]["flight_id"])
          current_flight.update_attributes({:min_pax => flight[1]["min_pax"], :max_pax => flight[1]["max_pax"]})

          #update charge id (currently each flght id has only one charge schedule)
          Rails.logger.info "Updating existing charge schedule #{flight[1][:charge_id]}"
          cs = ChargeSchedule.find(flight[1]["charge_id"])
          cs.update_attributes({:session_price => flight[1]["session_price"], :cart => flight[1]["buggy"],
            :caddy => flight[1]["caddy"], :insurance => flight[1]["insurance"]})

          #remove flight matrices that does not exists anymore
          new_times = flight[1][:times].map{|x| Time.parse("2000-01-01 #{x} +0000")}
          current_flight.flight_matrices.where.not(:tee_time => new_times).each{ |x| x.destroy }

          #handle the flight matrices
          flight[1][:times].each do |flight_time|

            #check if this exists or not
            fm = current_flight.flight_matrices.where(:tee_time => Time.parse("2000-01-01 #{flight_time} +0000")).first
            if fm.nil? then
              #create new
              fm = current_flight.flight_matrices.new(flight[1]["days"].inject({:tee_time => flight_time}){|p,n| p.merge({ "day#{n}".to_sym => 1}) })
              fm.save!
            else
              #update the days / what not
              fm.update_attributes(
                [1,2,3,4,5,6,7].inject({}){|p,n| p.merge({"day#{n}".to_sym => 0})}.merge(
                  flight[1]["days"].inject({:tee_time => flight_time}){|p,n| p.merge({ "day#{n}".to_sym => 1}) }
                )
              )
            end
          end
        else
          #if new, cerate new flight info
          gc.createFlightSchedule(
            {:min_pax => flight[1][:min_pax], :max_pax => flight[1][:max_pax]},
            {:session_price => flight[1]["session_price"], :caddy => flight[1]["caddy"],
              :insurance => flight[1]["insurance"], :cart => flight[1]["buggy"]},
            flight[1][:days],
            flight[1][:times]
          )
        end

      end
    end

    #everything ok, redirect_to site
    respond_to do |format|
      format.html {

      }
      format.json {
        render json:{ :path => {:admin => admin_golf_club_path(gc)}, :user => golf_club_path(gc) }
      }
    end
  end

  def golf_club_params
    params.require(:golf_club).permit(:name, :description, :address, :open_hour, :close_hour);
  end
end
