class UsersController < ApplicationController
  # GET      /users/:id
  def show
      @user = User.find(params[:id])
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

  def user_params
    params.require(:user).permit(:name, :home_club, :handicap)
  end
end
