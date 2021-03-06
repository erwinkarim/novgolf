#class DeviseMailer < ApplicationMailer
class DeviseMailer < Devise::Mailer
  helper :application # gives access to all helpers defined within `application_helper`.
  include Devise::Controllers::UrlHelpers # Optional. eg. `confirmation_url`
  default template_path: 'devise/mailer' # to make sure that your mailer uses the devise views
  default from: "JomGolf <do-not-reply@jomgolf.com.my>"
  layout false

  def confirmation_instructions(record, token, opts={})
    @token = token
    @resource = record
    # Custom logic to send the email with MJML
    mail(
      template_path: 'devise/mailer',
      to: record.email,
      subject: "Confirm Your Email"
    ) do |format|
      format.mjml
      format.text
    end
  end

  def reset_password_instructions(record, token, opts={})
    @token = token
    @resource = record
    # Custom logic to send the email with MJML
    mail(
      template_path: 'devise/mailer',
      to: record.email,
      subject: "Reset Your Password"
    ) do |format|
      format.mjml
      format.text
    end
  end

  def unlock_instructions(record, token, opts={})
    @token = token
    @resource = record
    # Custom logic to send the email with MJML
    mail(
      template_path: 'devise/mailer',
      to: record.email,
      subject: "Unlock Your Account"
    ) do |format|
      format.mjml
      format.text
    end
  end

  def password_change(record, opts={})
    @resource = record
    mail(
      template_path: 'devise/mailer',
      to: record.email,
      subject: "Change Your Password"
    ) do |format|
      format.mjml
      format.text
    end
  end
end
