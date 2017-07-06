class Admin::CourseListingsController < ApplicationController
  before_action :admins_only
  
  # GET      /admin/courses
  def index
  end

  # GET      /admin/courses/load
  def load
    render json: current_user.golf_clubs.map{ |x| { id:x.id, name:x.name, course_listings:x.course_listings}}
  end
end
