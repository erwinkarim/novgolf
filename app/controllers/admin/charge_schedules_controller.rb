class Admin::ChargeSchedulesController < ApplicationController
  #GET      /admin/golf_clubs/:golf_club_id/charge_schedules(.:format)
  def index
    @golf_club = GolfClub.find(params[:golf_club_id])
  end
end
