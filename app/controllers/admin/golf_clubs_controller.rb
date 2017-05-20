class Admin::GolfClubsController < ApplicationController
  #require login
  #before_action :authenticate_user!
  before_action :admins_only

  def index
    @golf_clubs = current_user.golf_clubs
  end

  # GET      /admin/golf_clubs/:id(.:format)
  def show
    #ensure that you can actually view this
    @golf_club = GolfClub.find(params[:id])

    @course_listings = @golf_club.course_listings

    if current_user.id == @golf_club.user_id then
      respond_to do |format|
        format.html
        format.json {
          date = params.has_key?(:date) ? Date.parse(params[:date]) : Date.today + 1.day
          result = GolfClub.search({ dateTimeQuery:Time.parse("#{date} 14:00 +0000"), spread:9.hours, club_id:params[:id],
            loadCourseData:true, adminMode:true}).first
          result = result.nil? ? {:club => [], :flights => [], :queryData => []} : result
          render json:result
        }
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
    @dummy_data = {course_listing:CourseListing.new.attributes.merge({golf_club_id:@golf_club.id}), course_status:CourseStatus.all}
    @golf_club_attributes = @golf_club.attributes.merge(
      { open_hour:@golf_club.open_hour.strftime("%H:%M"), close_hour:@golf_club.close_hour.strftime("%H:%M"), tax_schedule:@golf_club.tax_schedule}
    )
    @golf_club_attributes = @golf_club.course_listings.empty? ?
      @golf_club_attributes.merge({course_listings:[@dummy_data[:course_listing]]}) :
      @golf_club_attributes.merge( { course_listings: @golf_club.course_listings} )

    #need to merge w/ default
    @dummy = (FlightSchedule.new.attributes.merge("charge_schedule" => ChargeSchedule.new.attributes)).
      merge("flight_matrices" => [FlightMatrix.new.attributes.merge("tee_time" => "7:00am")])
    @flight_schedules = [
      (FlightSchedule.new.attributes.merge("charge_schedule" => ChargeSchedule.new.attributes)).
      merge("flight_matrices" => [FlightMatrix.new.attributes.merge("tee_time" => "07:00am")])
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

    #titleize the name
    params[:golf_club][:name] = params[:golf_club][:name].titleize

    golf_club = current_user.golf_clubs.new(golf_club_params)

    golf_club.transaction do
      golf_club.save!
      golf_club.setFlightSchedule(params[:flight])

      #course listings
      golf_club.setCourseListing(params[:courses])

      #amenities
      new_am = params.has_key?(:amenities) ? params[:amenities].map{ |x,y| x.to_i } : []
      new_am.each{ |x| golf_club.amenity_lists.new(:amenity_id => x).save!}
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
    @flight_schedules = @golf_club.active_flight_schedules.map do |fs|
      (
        fs.attributes.merge("charge_schedule" => fs.charge_schedule.attributes)
      ).
      merge(
        "flight_matrices" => fs.active_flight_matrices.order(:tee_time).map{
          |x| x.attributes.merge({"tee_time" => x.tee_time.strftime("%I:%M%P"),
            "second_tee_time" => x.second_tee_time.nil? ? nil : x.second_tee_time.strftime("%I:%M%P")} )
        }
      )
    end
    @dummy_data = {course_listing:CourseListing.new.attributes.merge({golf_club_id:@golf_club.id}), course_status:CourseStatus.all}

    @golf_club_attributes = @golf_club.attributes.merge(
      { open_hour:@golf_club.open_hour.strftime("%H:%M"), close_hour:@golf_club.close_hour.strftime("%H:%M"), tax_schedule:@golf_club.tax_schedule}
    )
    @golf_club_attributes = @golf_club.course_listings.empty? ?
      @golf_club_attributes.merge({course_listings:[@dummy_data[:course_listing]]}) :
      @golf_club_attributes.merge( { course_listings: @golf_club.course_listings} )

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
    # => update the course listings
    # =>  update the flight schedules
    #   => update the charge schedule associated with the flight schedules
    #   => update the flight matrices assocaited with the flight scheduleso
    # TODO: rescue from exception during transaction

    gc = GolfClub.find(params[:id])

    gc.transaction do
      #titleize the name
      params[:golf_club][:name] = params[:golf_club][:name].titleize

      gc.update_attributes(golf_club_params)

      # course listings
      gc.setCourseListing(params[:courses])

      # flight schedules
      gc.setFlightSchedule(params[:flight])

      #update amenities listings
      #get current listing
      current_am = gc.amenity_lists.map{ |x| x.amenity_id }
      new_am = params.has_key?(:amenities) ? params[:amenities].map{ |x,y| x.to_i } : []

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
        flash[:notice] = "Club Info Updated"
        render json:{ :path => {:admin => admin_golf_club_path(gc)}, :user => golf_club_path(gc) }
      }
    end
  end

  # GET      /admin/golf_clubs/:golf_club_id/tax_schedule(.:format)
  def tax_schedule
    render json: {tax_schedules:TaxSchedule.all, selected:GolfClub.find(params[:golf_club_id]).tax_schedule.id}
  end

  def tax_schedules
    render json: {tax_schedules:TaxSchedule.all, selected:TaxSchedule.first.id}
  end

  # GET      /admin/golf_clubs/:golf_club_id/line_items
  def charge_schedules
    # should return the line items + appropiate charges
    # maybe charge_schedule outer join the line_item_listings + line_item

    #expected return is
    # {
    #   charge_schedules: [{id:x, ..charge_schedule_info..,
    #     line_item_listings:[{line_item_listing_id:x, rate:x, taxed:x, name:'x', description:x}, {..}, {..}]]
    # }
    render json: {
      charge_schedules:GolfClub.find(params[:golf_club_id]).
        charge_schedules.
        map{ |x| x.attributes.merge( {line_item_listings:x.line_item_listings})}
    }
  end

  #return the flight array on date + next 6 days
  #json only format
  # GET      /admin/golf_clubs/:golf_club_id/flights(.:format)
  def flights
    club = GolfClub.find(params[:golf_club_id])
    if club.user_id != current_user.id then
      render json:{message:'you do not own this club'}, status: :unauthorized
      return
    end

    date = params.has_key?(:date) ? Date.parse(params[:date]) : Date.today + 1.day
    results = []
    (date..date+6).each do |date_query|
      result = GolfClub.search({ dateTimeQuery:Time.parse("#{date_query} 14:00 +0000"), spread:9.hours, club_id:club.id,
        loadCourseData:true, adminMode:true}).first
      results << (result.nil? ? {:club => [], :flights => [], :queryData => []} : result)
    end

    render json:results

  end

  def golf_club_params
    params.require(:golf_club).permit(:name, :description, :address, :open_hour, :close_hour, :lat, :lng, :tax_schedule_id);
  end

  # DELETE   /admin/golf_clubs/:id(.:format)
  def destroy
    club = GolfClub.find(params[:id])

    destroy_attemp = club.destroy

    if destroy_attemp then
      flash[:notice] = "Club '#{club.name}' has been deleted"
      redirect_to admin_golf_clubs_path
    else
      flash[:error] = "Unable to delete club #{club.name}"
      render json {message:'delete attemp failed'}, status: :internal_server_error
    end

  end
end
