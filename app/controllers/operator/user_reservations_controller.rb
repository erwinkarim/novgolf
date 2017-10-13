class Operator::UserReservationsController < ApplicationController
  before_action :operators_only

  #load the recourses based on user
  # also based on time_id, if new and search citeria
  # GET      /operator/user_reservations(.:format)
  def index
    #if time_id is not specified, assume that since begining of time
      # otherwise load from time_id
    #load the ur w/ status await_assignment

    #all awaiting assignments
    current_user_id = current_user.id
    # TODO: select reservations based on view mode (default, canceled, pending, etc..)
    reservations = params[:view] == 'canceled' ? (
      UserReservation.includes(:golf_club, :user).joining{:ur_turk_case}.where.has{
        (status.eq 13) &
        (ur_turk_case.user_id.eq current_user_id)
      }.order(:booking_date, :booking_time).map{ |x| x.to_operator_format}
    ) : params[:view] == 'confirmed' ? (
      UserReservation.includes(:golf_club, :user).joining{:ur_turk_case}.where.has{
        (status.eq 11) | (status.eq 3) &
        (ur_turk_case.user_id.eq current_user_id)
      }.order(:booking_date, :booking_time).map{ |x| x.to_operator_format}
    ) : params[:view] == 'unassigned' ? (
      #awaiting assignmnets
      UserReservation.includes(:golf_club, :user).where.has{
        (status.eq 9)
      }.order(:booking_date, :booking_time).map{ |x| x.to_operator_format }
    ) : params[:view] == 'pending' ? (
      #assigned to current user, but awaiting confirmation
      UserReservation.includes(:golf_club, :user).joining{ur_turk_case}.where.has{
        (status.eq 10) & (ur_turk_case.user_id.eq current_user_id)
      }.order(:booking_date, :booking_time).map{ |x| x.to_operator_format }
    ) : params[:view] == 'newtime' ? (
      UserReservation.includes(:golf_club, :user).joining{ur_turk_case}.where.has{
        (status.eq 12) & (ur_turk_case.user_id.eq current_user_id)
      }.order(:booking_date, :booking_time).map{ |x| x.to_operator_format }
    ) : (
      #default view
      UserReservation.includes(:golf_club, :user).where.has{
        # status is awaiting assignments
        (id.in UserReservation.where.has{(status.eq 9)}.selecting{:id}) |
        # status is assigned by current operator, but no action taken yet
        (id.in UserReservation.joining{ur_turk_case}.where.has{
            (status.eq 10) & (ur_turk_case.user_id.eq current_user_id)
          }.selecting{:id}
        )
      }.order(:booking_date, :booking_time).map{ |x| x.to_operator_format }
    )

    # TODO: order by reservation due date, top reservation closest to due date
    respond_to do |format|
      format.json {
        render json: { reservations: reservations}
      }
    end
  end

  # POST     /operator/user_reservations/:user_reservation_id/assign_to_me(.:format)
  def assign_to_me
    # load the reservation and update the status
    ur = UserReservation.find(params[:user_reservation_id])

    # check there's no ur_turk_case associated w/ this ur
    # if there is, new case history that you take over
    # otherwise, create new ur_turk_case w/ historically entry of one
    # update the status of the ur
    # return the ur, otherwise, send error codes
    # TODO: render error response code
    ur.transaction do
      if ur.ur_turk_case.nil? then
        turk_case = UrTurkCase.new({user_reservation_id:ur.id, user_id:current_user.id})
        turk_case.save!
      else
        turk_case = ur.ur_turk_case
      end

      case_history = turk_case.ur_turk_case_histories.new({
        action:UrTurkCaseHistory.actions[:assign_to_me],
        action_by:current_user.id
      })
      case_history.save!

      ur.operator_assigned!
    end

    render json: ur.to_operator_format
  end

  # find the reservation
  # update add ur case history
  # update the ur status
  # send the email
  # return the updated reservation
  # POST     /operator/user_reservations/:user_reservation_id/confirm(.:format)
  def confirm
    ur = UserReservation.find(params[:user_reservation_id])

    ur.transaction do
      case_history = ur.ur_turk_case.ur_turk_case_histories.new({
        action:UrTurkCaseHistory.actions[:confirm], action_by:current_user.id
      })
      case_history.save!
      ur.operator_confirmed!
      ur.reservation_confirmed!
    end

    #TODO: handle if transaction failed
    head :ok
  end

  # cancels the reservation
  # find, update the casehistory then update the status
  # POST     /operator/user_reservations/:user_reservation_id/cancel(.:format)
  def cancel
    ur = UserReservation.find(params[:user_reservation_id])
    ur.transaction do
      case_history = ur.ur_turk_case.ur_turk_case_histories.new({
        action:UrTurkCaseHistory.actions[:cancel_reservation], action_by:current_user.id
      })
      case_history.save!
      ur.operator_canceled!
    end

    #TODO: handle if there some issues abount
    head :ok
  end

  # update the reservation based on proposed new time
  # POST     /operator/user_reservations/:user_reservation_id/propose_new_time
  def propose_new_time
    ur = UserReservation.find(params[:user_reservation_id])

    # check if new proposal is A-OK
    # conflict check

    # update the reservation to new date + time
    render json: ur.to_operator_format
  end

  # get individual user_reservation data for turl console
  # GET /operator/user_reservations/:id
  def show
  end
end
