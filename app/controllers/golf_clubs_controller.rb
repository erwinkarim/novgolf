class GolfClubsController < ApplicationController
  def index
    @golf_clubs = GolfClub.all

    respond_to do |format|
      format.tpl
    end
  end

  # GET      /golf_clubs/:id
  def show
    @club = GolfClub.find(params[:id])

    if params.has_key? :date then
      @date = Date.parse(params[:date])
    else
      @date = Date.today
    end

    @result = GolfClub.search({ :dateTimeQuery => Time.parse("#{@date} 14:00 +0000"), :spread => 9.hours, :club_id => params[:id]}).first

    respond_to do |format|
      format.html
      format.json {
        render json:@result
      }
    end
  end

  def join
  end

  # GET      /golf_clubs/:golf_club_id/schedule(.:format)
  # get the golf club schedule, defaults to today's schedule
  def schedule
    if params.has_key? :queryDate then
      queryDate = Date.parse(params[:queryDate])
    else
      queryDate = Date.today
    end
  end

  def golf_club_params
    params.require(:golf_club).permit(:name, :description, :address, :open_hour, :close_hour);
  end

end
