class UserMailer < ApplicationMailer
  #layout 'mailer'
  layout false

  def test
    mail(to: "erwinkarim@gmail.com", subject: "Test!!!") do |format|
      format.text
      format.mjml
    end
  end

  # user_reservations is an array of user_reservations
  def reservation_confirmed user_reservations = []
    @reservations = user_reservations
    mail(to: "erwinkarim@gmail.com", subject: "Your Reservation(s) is Confirmed")
  end
end
