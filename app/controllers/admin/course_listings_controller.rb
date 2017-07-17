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
        course_listings:@club.course_listings.map{|course| course.attributes.merge({course_status:course.course_status})},
        course_global_setting:@club.course_global_setting.attributes.merge({
            admin_selection_value:CourseGlobalSetting.admin_selections[@club.course_global_setting.admin_selection],
            user_selection_value:CourseGlobalSetting.user_selections[@club.course_global_setting.user_selection]
          })
      }
    end

    respond_to do |format|
      format.html
      format.json { render json: club}
    end
  end

  # PATCH    /admin/golf_clubs/:golf_club_id/courses/global_setting(.:format)
  def update_global_setting
    club = GolfClub.find(params[:golf_club_id])

    #ensure that you own this
    if club.user_id != current_user.id then
      render json: {message:'You don\'t own this club'}, status: :unauthorized
      return
    end

    #update the CourseGlobalSetting object and give the new version of things
    cgs = club.course_global_setting
    cgs.assign_attributes({
      admin_selection:params[:admin_selection].to_i, user_selection:params[:user_selection].to_i
    })

    if cgs.save! then
      render json: {message:'Ok'}
    else
      render json: {message: cgs.errors.messages.join(';')}, status: :internal_server_error
    end

  end

  # GET      /admin/courses/load
  def load
    render json: current_user.golf_clubs.map{ |x| { id:x.id, name:x.name, course_listings:x.course_listings}}
  end
end
