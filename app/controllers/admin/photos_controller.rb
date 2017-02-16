class Admin::PhotosController < ApplicationController
  before_action :admins_only

  # GET      /admin/golf_clubs/:golf_club_id/photos(.:format)
  def index
    @golf_club = GolfClub.find(params[:golf_club_id])
    photos = @golf_club.photos.reverse

    if current_user.id == @golf_club.user_id then
      respond_to do |format|
        format.html
        format.json {
          render json: photos.map{ |x| x.to_json.merge( {:delete => admin_golf_club_photo_path(@golf_club, x) }) }
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

    file = params[:files].first
    photo = golf_club.photos.new({ :avatar => file, :user_id => current_user.id, :caption => file.instance_variable_get(:@original_filename) })

    #create the photos
    photo.transaction do
      photo.save
      Rails.logger.info "file = #{file.instance_variable_get(:@original_filename)}"
    end
    #Rails.logger.info "photo = #{photo.inspect}"


    #create avatar picture and return the json inf
    respond_to do |format|
      format.json {
        render json: {status:"sucess!!"}
      }
    end
  end

  # DELETE   /admin/golf_clubs/:golf_club_id/photos/:id
  def destroy
    photo = Photo.find(params[:id])

    #ensure that you are the owner of the photo
    if photo.user_id == current_user.id then
      photo.destroy
      photos = GolfClub.find(params[:golf_club_id]).photos
      render :json => photos.map{ |x| x.to_json.merge({:delete => admin_golf_club_photo_path(params[:golf_club_id], x)}) }, :status => :ok
    else
      render :nothing => true, :status => :unauthorized
    end

  end

  # PATCH    /admin/golf_clubs/:golf_club_id/photos/:id
  # PUT      /admin/golf_clubs/:golf_club_id/photos/:id
  def update
    photo = Photo.find(params[:id])

    if photo.user_id == current_user.id then
      #update the photo
      photo.update_attributes(photo_params)
      head :ok
    else
      head :unauthorized
    end
  end

  def photo_params
    params.require(:photo).permit(:caption, :sequence)
  end
end
