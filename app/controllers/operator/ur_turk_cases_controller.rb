class Operator::UrTurkCasesController < ApplicationController
  # GET      /operator/user_reservations/:user_reservation_id/ur_turk_cases(.:format)
  # load ur_turk_case_histories for the associated user reservations
  def index
    ur = UserReservation.includes(:ur_turk_case, :user).find(params[:user_reservation_id])
    turk_case = ur.ur_turk_case
    result = turk_case.nil? ?
      {turk_case_histories:[]} :
      turk_case.attributes.merge({
        ur_turk_case_histories:turk_case.ur_turk_case_histories.map{ |x| x.attributes.merge({user:x.user})}
      })
    render json: result
  end
end
