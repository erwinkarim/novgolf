class Admin::MembershipsController < ApplicationController
  # GET      /admin/golf_clubs/:golf_club_id/memberships(.:format)
  def index
    @club = GolfClub.find(params[:golf_club_id])
    @memberships = @club.memberships
  end
end
