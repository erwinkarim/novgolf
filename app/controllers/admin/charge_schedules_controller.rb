class Admin::ChargeSchedulesController < ApplicationController
  #GET      /admin/golf_clubs/:golf_club_id/charge_schedules(.:format)
  def index
    @golf_club = GolfClub.find(params[:golf_club_id])

    respond_to do |format|
      format.html { }
      format.json {
        render json: {
          charge_schedules:GolfClub.find(params[:golf_club_id]).
            charge_schedules.
            map{ |x| x.attributes.merge( {line_item_listings:x.line_item_listings})}
        }
      }
    end
  end
end
