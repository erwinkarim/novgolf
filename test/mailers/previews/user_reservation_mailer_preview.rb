# Preview all emails at http://localhost:3000/rails/mailers/user_reservation_mailer
class UserReservationMailerPreview < ActionMailer::Preview
  def request_review
    UserReservationMailer.request_review(UserReservation.last)
  end

end
