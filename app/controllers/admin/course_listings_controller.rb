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
        course_listings:@club.course_listings.map{|course|
          course.attributes.merge({course_status:course.course_status, course_settings:course.course_settings})
        },
        course_global_setting:@club.course_global_setting.attributes.merge({
            admin_selection_value:CourseGlobalSetting.admin_selections[@club.course_global_setting.admin_selection],
            user_selection_value:CourseGlobalSetting.user_selections[@club.course_global_setting.user_selection]
          }),
      }
    end

    respond_to do |format|
      format.html
      format.json { render json: club}
    end
  end

  # PATCH    /admin/golf_clubs/:golf_club_id/courses/global_setting(.:format)
  def update_global_setting
    check_club_owner params[:golf_club_id]

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

  # PATCH    /admin/golf_clubs/:golf_club_id/courses/:id(.:format)
  # update the selected course
=begin
  # sample parameter: {"authenticity_token"=>"...",
    "name"=>"Course #1", "course_status_id"=>"1",
    "course_setting"=>{
      "5d562a"=>{"id"=>"", "course_setting_property_id"=>"1", "value_type"=>"integer", "value_int"=>"0"},
      "3a1e72"=>{"id"=>"", "course_setting_property_id"=>"2", "value_type"=>"integer", "value_int"=>"3"},
      "e20879"=>{"id"=>"", "course_setting_property_id"=>"3", "value_type"=>"string", "week"=>"1", "day"=>"0"},
      "4f9943"=>{"id"=>"", "course_setting_property_id"=>"4", "value_type"=>"range", "value_min"=>"2017-07-27", "value_max"=>"2017-07-29"}}
    }
=end
  def update
    check_club_owner params[:golf_club_id]

    #should update the course id name, availablitty and settings
    cl = CourseListing.find(params[:id])

    #update the course name, availablitty
    cl.update_attributes(course_listing_param)
    #update the course settings
    cl.setCourseSettings params[:course_setting].to_unsafe_h.map{ |k,v| v}

    head :ok

  end

  # GET      /admin/golf_clubs/:golf_club_id/courses/statuses(.:format)
  # return a json object of all statuses
  def statuses
    render json: CourseStatus.all
  end

  def defaults
    render json: {course_statuses: CourseStatus.all, course_setting_properties: CourseSettingProperty.all}
  end

  private
  def check_club_owner club_id
    club = GolfClub.find(club_id)

    #ensure that you own this
    if club.user_id != current_user.id then
      render json: {message:'You don\'t own this club'}, status: :unauthorized
      return
    end
  end

  def course_listing_param
    params.require(:course_listing).permit(:name, :course_status_id)
  end
end
