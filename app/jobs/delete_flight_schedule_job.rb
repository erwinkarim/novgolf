class DeleteFlightScheduleJob < ApplicationJob
  queue_as :default

  #deep delete an empty flight schedule
  # plan:-
  # 1. check if there's assocaited user_reservation
  # 2. if there's no user_reservation, delete all flight matrices
  # 3. delete the flight schedule
  def perform flightScheduleID
    Rails.logger.info "ActiveJob:: Attempting to delete Flight Schedule #{flightScheduleID}"
    fs = FlightSchedule.find(flightScheduleID)
    uRFound = false

    fs.flight_matrices.each do |fm|
      if !fm.user_reservations.empty? then
        uRFound = true
        break
      end
    end

    # skip deleting the flight schedules if there's a user reservation assocaited
    # with this schedule (do not delete user reservation for record keeping purpose)
    if uRFound then
      Rails.logger.info "ActiveJob:: There are reservations assocated with flight schedule #{flightScheduleID}. Job aborted"
    else
      fs.destory
      Rails.logger.info "ActiveJob:: Flight Schedule #{flightScheduleID} deleted"
    end
  end
end
