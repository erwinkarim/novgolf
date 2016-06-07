class Admin::GolfClubsController < ApplicationController
  #require login
  before_action :authenticate_user!

  def index
    @golf_clubs = current_user.golf_clubs
  end

  # GET      /admin/golf_clubs/:id(.:format)
  def show
    #ensure that you can actually view this
    @golf_club = GolfClub.find(params[:id])

    if current_user.id == @golf_club.id then
      respond_to do |format|
        format.html
        format.json
      end
    else
      render :file => "404", :code => :unauthorized
    end
  end

  # GET      /admin/golf_clubs/:golf_club_id/dashboard
  def dashboard
    @golf_club = GolfClub.find(params[:golf_club_id])
  end
end
