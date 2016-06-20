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
  # TODO: rescue from transactio
  def create
    #create all the prototypes
    #golf_club = GolfClub.new(golf_club_params)
    golf_club = current_user.golf_clubs.new(golf_club_params)

    golf_club.transaction do
      golf_club.save!
      golf_club.setFlightSchedule(params[:flight])

      #amenities
      new_am = params[:amenities].map{ |x,y| x.to_i }
      new_am.each{ |x| gc.amenity_lists.new(:amenity_id => x).save!}
    end

    respond_to do |format|
      format.html{
          redirect_to admin_golf_club_path(golf_club), :status => :created
      }
      format.json{
        render json:{ :path => {:admin => admin_golf_club_path(golf_club)}, :user => golf_club_path(golf_club) }
      }
    end
  end

  # GET      /admin/golf_clubs/:id/edit(.:format)
  def edit
    @golf_club = GolfClub.find(params[:id])
    @flight_schedules = @golf_club.flight_schedules.map do |fs|
      (
        fs.attributes.merge("charge_schedule" => fs.charge_schedule.attributes)
      ).
      merge(
        "flight_matrices" => fs.flight_matrices.map{
          |x| x.attributes.merge({"tee_time" => x.tee_time.strftime("%I:%M%P")} )
        }
      )
    end
    @dummy = (FlightSchedule.new.attributes.merge("charge_schedule" => ChargeSchedule.new.attributes)).
      merge("flight_matrices" => [FlightMatrix.new.attributes.merge("tee_time" => "7:00am")])
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
    #   => update the flight matrices assocaited with the flight scheduleso
    # TODO: rescue from exception during transaction
    gc = GolfClub.find(params[:id])

    gc.transaction do
      gc.update_attributes(golf_club_params)

      # flight schedules
      gc.setFlightSchedule(params[:flight])

      #update amenities listings
      #get current listing
      current_am = gc.amenity_lists.map{ |x| x.amenity_id }
      new_am = params[:amenities].map{ |x,y| x.to_i }

      #delete the ones that are not there anymore
      gc.amenity_lists.where(:amenity_id => current_am - new_am).each{ |x| x.destroy }
      #add the new ones that are there
      (new_am - current_am).each{ |x| gc.amenity_lists.new(:amenity_id => x).save!}
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
    params.require(:golf_club).permit(:name, :description, :address, :open_hour, :close_hour, :lat, :lng);
  end
end