class Admin::CourseListingsController < ApplicationController
  before_action :admins_only

  # GET      /admin/golf_clubs/:golf_club_id/courses(.:format)
  def index
    # load the club
    @club = GolfClub.find(params[:golf_club_id])

    #make sure you own the club
    if @club.user_id != current_user.id then
      render json: {message:'You don\'t own this club'}, status: :unauthorized
      return
    end

    #load more details if asked via json
    if(params[:format] == 'json') then
      club = {
        id:@club.id, name:@club.name,
        course_listings:@club.course_listings.map{|course| course.attributes.merge({course_status:course.course_status})}
      }
    end

    respond_to do |format|
      format.html
      format.json { render json: club}
    end
  end

  # GET      /admin/courses/load
  def load
    render json: current_user.golf_clubs.map{ |x| { id:x.id, name:x.name, course_listings:x.course_listings}}
  end
end
