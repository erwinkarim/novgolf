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
    mail(to: @reservations.first.user.email, subject: "Your Reservation(s) is Confirmed") do |format|
      format.text
      format.mjml
    end
  end

  def reservation_await_assignment user_reservations = []
    @reservations = user_reservations
    mail(to: @reservations.first.user.email, subject: "Payment for reservation(s) is Confirmed") do |format|
      format.text
      format.mjml
    end
  end

  #send email notification that invoice is ready
  def invoice_is_ready invoice = Invoice.first
    @invoice = invoice
    mail(to: @invoice.user.email, subject: "You Invoice is ready") do |format|
      format.text
      format.mjml
    end
  end
end
