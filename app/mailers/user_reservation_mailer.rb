class UserReservationMailer < ApplicationMailer
  layout false

  def request_review user_reservation
    #if the reservation is still valid, send out mail
    if user_reservation.payment_confirmed? || user_reservation.reservation_confirmed? then
      @reservation = user_reservation
      @user = user_reservation.user
      mail(to:@user.email, subject:"Review your flight") do |format|
        format.text
        format.mjml
      end
    end
  end

  #send reminder about
  def notify user_reservation
    @reservation = user_reservation
    if @reservation.contact.nil? then
      Rails.logger.info "UserReservationMailer/notify: No email detected"
      return
    end

    @user = @reservation.user
    @contact = @reservation.contact

    mail(to:@contact.email, subject:"Reminder about your reservation") do |format|
      format.text
      format.mjml
    end
  end

  # operator has confirmed the reservation
  def operator_confirmed reservation
    @reservation = reservation
    @user = @reservation.user

    mail(to:@user.email, subject:"Your Reservations has been confirmed") do |format|
      format.text
      format.mjml
    end
  end

  # operator canceled the reservation
  def operator_canceled reservation
  end

  # operator proposed new time
  def operator_new_proposal reservation
  end
end
