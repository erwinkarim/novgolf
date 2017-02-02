#class DeviseMailer < ApplicationMailer
class DeviseMailer < Devise::Mailer
  helper :application # gives access to all helpers defined within `application_helper`.
  include Devise::Controllers::UrlHelpers # Optional. eg. `confirmation_url`
  default template_path: 'devise/mailer' # to make sure that your mailer uses the devise views
  layout false

  def confirmation_instructions(record, token, opts={})
    @token = token
    @resource = record
    # Custom logic to send the email with MJML
    mail(
      template_path: 'devise/mailer',
      from: "JomGolf <do-not-reply@jomgolf.com.my>",
      to: record.email, 
      subject: "Confirm Your Email"
    ) do |format|
      format.mjml
      format.text
    end
  end
end
