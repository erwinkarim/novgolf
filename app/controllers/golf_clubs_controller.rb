class GolfClubsController < ApplicationController

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
        @photos = @club.photos.reverse
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
