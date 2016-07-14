class Admin::PhotosController < ApplicationController
  before_action :authenticate_user!

  # GET      /admin/golf_clubs/:golf_club_id/photos(.:format)
  def index
    @golf_club = GolfClub.find(params[:golf_club_id])
    photos = @golf_club.photos


    if current_user.id == @golf_club.user_id then
      respond_to do |format|
        format.html
        format.json {
          render json: photos.map{ |x| x.to_json }
        }
      end
    else
      render :file => "public/401.html", :code => :unauthorized
    end
  end

  # POST      /admin/golf_clubs/:golf_club_id/photos(.:format)
  def create
    golf_club = GolfClub.find(params[:golf_club_id])

    if current_user.id != golf_club.user_id then
      render :file => "public/401.html", :code => :unauthorized
    end

    #create the photos
    file = params[:files].first
    photo = golf_club.photos.new({ :avatar => file, :user_id => current_user.id })
    Rails.logger.info "photo = #{photo}"
    photo.save

    #create avatar picture and return the json inf
    respond_to do |format|
      format.json {
        render json: {status:"sucess!!"}
      }
    end
  end
end
