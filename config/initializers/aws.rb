if Rails.env.production? then
  #setup aws ses
  creds = Aws::Credentials.new(ENV['SMTP_USER'], ENV['SMTP_PASS'])
  Aws::Rails.add_action_mailer_delivery_method(:aws_sdk, credentials: creds, region: ENV['SMTP_REGION'] )
end
