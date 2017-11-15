class Operator::OperatorController < ApplicationController
  before_action :operators_only
  # GET      /operator(.:format)
  def index
    redirect_to operator_console_path
  end

  # GET      /operator/console(.:format)
  def turk_console
  end

  #load the recourses based on user
  # also based on time_id, if new
  # GET      /operator/load(.:format)
  def load
    #if time_id is not specified, assume that since begining of time
      # otherwise load from time_id
    #load the ur w/ status await_assignment
    #TODO: order by order date closest to current date
    ur_await_assignment = UserReservation.includes(:golf_club).where.has{(status.eq 9)}.map{ |x|
      x.attributes.merge({golf_club:x.golf_club})
    }

    respond_to do |format|
      format.json {
        render json: { reservations: ur_await_assignment }
      }
    end
    #load the ur that current operator is/has handled
  end

end
