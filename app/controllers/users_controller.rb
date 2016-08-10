class UsersController < ApplicationController
  before_action :authenticate_user!, :only => [:profile_picture, :update_profile_picture]
  # GET      /users/:id
  def show
      @user = User.find(params[:id])
      @reviews = @user.reviews.order(:created_at => :desc).limit(20).map{
        |x| x.to_json
      }
  end

  def edit
    @user = User.find(params[:id])

    if current_user.id != @user.id then
      render "public/404.htm", :status => :unauthorized
    end
  end

  def update
    @user = User.find(params[:id])

    if @user.update_attributes(user_params) then
      redirect_to user_path(@user)
    else
      flash[:notice] = "Error"
      redirect_to :back
    end

  end

  # GET      /users/:user_id/profile_picture(.:format)
  def profile_picture
    #ensure that you own the picture
    @user = User.find(params[:user_id])

    if @user.id == current_user.id then
      respond_to do |format|
        format.html
      end
    else
      render :file => "public/401.html", :code => :unauthorized
    end
  end

  #POST     /users/:user_id/profile_picture(.:format)
  def update_profile_picture
    @user = User.find(params[:user_id])

    Photo.transaction do
      file = params[:files].first
      photo = @user.photos.new({ :avatar => file, :user_id => current_user.id, :caption => file.instance_variable_get(:@original_filename) })

      if photo.save! then
        @user.update_attributes({ :image => photo.avatar.square400.url, :profile_picture_id => photo.id})
      end
    end

    if @user.id == current_user.id then
      respond_to do |format|
        format.json {
          render json: @user
        }
      end
    else
      render :file => "public/401.html", :code => :unauthorized
    end
  end

  def user_params
    params.require(:user).permit(:name, :home_club, :handicap)
  end
end
