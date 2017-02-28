class Admin::PhotosController < ApplicationController
  before_action :admins_only

  # GET      /admin/golf_clubs/:golf_club_id/photos(.:format)
  def index
    @golf_club = GolfClub.find(params[:golf_club_id])
    photos = @golf_club.photos.order(:sequence => :desc)

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
      new_sequence = golf_club.photos.maximum(:sequence)
      new_sequence = new_sequence.nil? ? 0 : new_sequence+1
      photo.assign_attributes({sequence:new_sequence})
      photo.save
      Rails.logger.info "file = #{file.instance_variable_get(:@original_filename)}"
    end
    #Rails.logger.info "photo = #{photo.inspect}"


    #create avatar picture and return the json inf
    respond_to do |format|
      format.json {
        render json: {status:"sucess!!", photo:photo.attributes}
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
      #update the sequencing
      if photo.sequence != params[:photo][:sequence].to_i then
        gc = GolfClub.find(params[:golf_club_id])
        photo_ids = gc.photos.order(:sequence => :asc).map{ |x| x.id }
        photo_ids.delete(photo.id)
        photo_ids.insert(params[:photo][:sequence].to_i, photo.id)
        gc.update_photo_sequence photo_ids
      end

      #update the photo
      photo.update_attributes(photo_params)

      render json: {photo:photo}, status: :ok
    else
      head :unauthorized
    end
  end

  # PATCH    /admin/golf_clubs/:golf_club_id/photos/update_sequence(.:format)
  # update the sequence based on new array of photo_ids
  def update_sequence
    if params.has_key? :sequence then
      gc = GolfClub.find(params[:golf_club_id])
      gc.update_photo_sequence params[:sequence]
    else
      head :bad_request
      return
    end
  end

  def photo_params
    params.require(:photo).permit(:caption, :sequence)
  end
end
