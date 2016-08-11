class UserMailer < ApplicationMailer
  def test
    mail(to: "erwinkarim@gmail.com", subject: "Test!!!")
  end

  def reservation_confirmed
    mail(to: "erwinkarim@gmail.com", subject: "Your Reservation is Confirmed")
  end
end
