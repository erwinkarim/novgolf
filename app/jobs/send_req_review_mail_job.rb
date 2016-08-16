class SendReqReviewMailJob < ActiveJob::Base
  queue_as :default

  # user_reservation is UserReservation class
  def perform(user_reservation)
    #check if the reservations is valid
    UserReservationMailer.request_review(user_reservation).deliver_later
  end
end
