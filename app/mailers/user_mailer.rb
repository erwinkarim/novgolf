class UserMailer < ApplicationMailer
  def test

    mail(to: "erwinkarim@gmail.com", subject: "Test!!!")
  end
end
