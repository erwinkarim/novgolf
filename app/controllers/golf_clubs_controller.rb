class GolfClubsController < ApplicationController
  def index
    @golf_clubs = GolfClub.all

    respond_to do |format|
      format.tpl
    end
  end

  # POST     /golf_clubs(
  #   Parameters: {
  # "golf_club"=>{"name"=>"", "description"=>"", "address"=>"", "open_hour"=>"10:00am", "close_hour"=>"8:00pm"},
  # "price_sch"=>{"16ddfa6f58f9"=>{"price"=>"", "caddy"=>"", "buddy"=>"", "insurance"=>""}},
  # "flight_sch"=>{"f70c29c0a17d"=>{"days" => ["monday", ... , "sunday"], "times"=>["9:30am"], "min_pax"=>"2", "max_pax"=>"4"}},
  # "submit"=>""}
  def create
    #sanity checks, if ok, then start pump data

    club = GolfClub.new(:name => params[:golf_club][:name],
      :description => params[:golf_club][:description], :address => params[:golf_club][:address],
      :open_hour => params[:golf_club][:open_hour], :close_hour => params[:golf_club][:close_hour]
    )

    if club.valid? then
      render :text => "valid"
    else
      render :text => "invalid: #{club.errors.messages}"
    end
=begin
    if golf_club.save! then
      #new price scheudle
      charge_schedule = golf_club.charge_schedules.new(:caddy => params[:caddy_price], :cart => params[:buggy_price],
        :session_price => params[:session_price])
       if charge_schedule.save! then
        render :nothing => true, :status => :ok
       else
        render :nothing => true, :status => :internal_server_error
       end
    else
      render :nothing => true, :status => :internal_server_error
    end
=end
  end

  def new
    @club = GolfClub.new
    @charge_schedule = [ChargeSchedule.new]
  end

  def golf_club_params
    params.require(:golf_club).permit(:name, :description, :address, :open_hour, :close_hour);
  end

end
