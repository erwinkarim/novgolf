class CheckPaymentStatusJob < ActiveJob::Base
  #check the payment status of UserReservation(s)
  #if created_at > 10.minutes and status is payment_attempted, the status will be changed to payment_failed

  queue_as :default

  def perform(reservations = [])
    reservations.each do |reservation|
      if reservation.created_at < DateTime.now + 10.minutes then
        if reservation.payment_attempted? then
          reservation.payment_failed!
        end
      else
        #if created_at is less than 10 minutes, check again in 10 minutes
        if reservation.payment_attempted? then
          CheckPaymentStatusJob.set(wait:10.minutes).perform_later([reservation])
        end
      end
    end
    # Do something later
  end
end
