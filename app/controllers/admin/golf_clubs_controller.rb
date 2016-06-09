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

    if current_user.id == @golf_club.id then
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

    if current_user.id == @golf_club.id then
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
  end

  # GET      /admin/golf_clubs/new
  def new
    @golf_club = GolfClub.new
    @flight_schedules = [FlightSchedule.new]
    @charge_schedules = [ChargeSchedule.new]

  end

  # POST     /admin/golf_clubs(.:format)
  def create
  end

  def golf_club_params
    params.require(:golf_club).permit(:name, :description, :address, :open_hour, :close_hour);
  end
end
