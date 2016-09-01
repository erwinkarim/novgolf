# Preview all emails at http://localhost:3000/rails/mailers/user_mailer
class UserMailerPreview < ActionMailer::Preview
  def test
    UserMailer.test
  end

  def reservation_confirmed_single
    UserMailer.reservation_confirmed [UserReservation.first]
  end

  def reservation_confirmed_multiple
    UserMailer.reservation_confirmed [UserReservation.first, UserReservation.last]
  end
end
