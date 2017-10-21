class GolfClubsController < ApplicationController
  # GET     /golf_clubs
  def index
    redirect_to root_path
  end

  # GET      /golf_clubs/:id
  def show
    begin
      @club = GolfClub.find(params[:id])
    rescue
      render :file => "public/404.html", :status => 404
      return
    end

    @date = params.has_key?(:date) ? Date.parse(params[:date]) : Date.today + 1.day

    loadCourseData = params.has_key?(:loadcoursedata) ? params[:loadcoursedata] : false

    @result = GolfClub.search({ dateTimeQuery:Time.parse("#{@date} 14:00 +0000"), spread:9.hours, club_id:params[:id] }).first
    #handle empty result
    @result = @result.nil? ? {:club => [], :flights => [], :queryData => []} : @result

    respond_to do |format|
      format.html {
        #additional stuff for normal page
        @photos = @club.photos.order(:sequence => :desc)
        @jumboPhoto = @photos.length == 0 ?
          { :url => "/images/golf_course_#{rand(1..4)}.jpg", :caption => "none" } :
          @jumboPhoto = { :url => @photos.first.avatar.url, :caption => @photos.first.caption }

        @got_reviews = !@club.reviews.empty?

        @desc_array = @club.description.split(/\n/)

      }
      format.json {
        render json:@result
      }
    end
  end

  def join
  end

  # GET      /golf_clubs/:golf_club_id/flight_listings(.:format)
  def flight_listings
    gc = GolfClub.find(params[:golf_club_id])
    date = params.has_key?(:date) ? Date.parse(params[:date]) : Date.tomorrow
    timeOnlyOption = params.has_key?(:time_only) ? params[:time_only] == "true" : false
    loadCourseDataOption = params.has_key?(:course_data) ? params[:course_data] == "true" : false

    respond_to do |format|
      format.json { render json:gc.getFlightListing(date, {timeOnly:timeOnlyOption, loadCourseData:loadCourseDataOption})}
    end
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

  # GET      /golf_clubs/:golf_club_id/open_courses(.:format)
  # show the open courses for that date
  def open_courses
    club = GolfClub.find(params[:golf_club_id])
    if params.has_key? :date then
      q_date = Date.parse(params[:date])
    else
      q_date = Date.today
    end

    render json: {course_listings_id:club.open_courses(q_date) }
  end
end
