# Preview all emails at http://localhost:3000/rails/mailers/devise_mailer
class DeviseMailerPreview < ActionMailer::Preview
  def send_confirmation_instructions
    Devise::Mailer.confirmation_instructions(User.last, "faketoken", {})
  end

  def reset_password_instructions
    Devise::Mailer.reset_password_instructions(User.last, "faketoken", {})
  end

  def unlock_instructions
    Devise::Mailer.unlock_instructions(User.last, "faketoken", {})
  end

  def password_change
    Devise::Mailer.password_change(User.last, {})
  end
end
