class UserReservationMailer < ApplicationMailer
  def request_review user_reservation
    #if the reservation is still valid, send out mail
    if user_reservation.payment_confirmed? || user_reservation.reservation_confirmed? then
      @reservation = user_reservation
      @user = User.find(user_reservation.user)
      mail(to:@user.email, subject:"Review your flight")
    end
  end
end
