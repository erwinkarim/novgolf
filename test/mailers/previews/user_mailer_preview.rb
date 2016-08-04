# Preview all emails at http://localhost:3000/rails/mailers/user_mailer
class UserMailerPreview < ActionMailer::Preview
  def test
    UserMailer.test
  end

  def reservation_confirmed
    UserMailer.reservation_confirmed
  end
end
