class Operator::UserReservationsController < ApplicationController
  before_action :operators_only

  #load the recourses based on user
  # also based on time_id, if new
  # GET      /operator/user_reservations(.:format)
  def index
    #if time_id is not specified, assume that since begining of time
      # otherwise load from time_id
    #load the ur w/ status await_assignment

    #all awaiting assignments
    ur_await_assignment = UserReservation.includes(:golf_club, :user).where.has{(status.eq 9)}.map{ |x|
      x.attributes.merge({golf_club:x.golf_club, user:x.user})
    }

    respond_to do |format|
      format.json {
        render json: { reservations: ur_await_assignment }
      }
    end
  end

  # POST     /operator/user_reservations/:user_reservation_id/assign_to_me(.:format)
  def assign_to_me
    # load the reservation and update the status
    # need to create an object to describe who's handing this user reservation / ticketing, etc
    # return the new reservation object
    head :ok
  end

  def confirm
    head :ok
  end

  def cancel
    head :ok
  end

  def propose_new_time
    head :ok
  end

  # get individual user_reservation data for turl console
  # GET /operator/user_reservations/:id
  def show
  end
end
