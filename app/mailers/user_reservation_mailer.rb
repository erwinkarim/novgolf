class UserReservationMailer < ApplicationMailer
  def request_review user_reservation
    @reservation = user_reservation
    @user = User.find(user_reservation.user)
    mail(to:@user.email, subject:"Review your flight")
  end
end
