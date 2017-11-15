class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  def admins_only
    authenticate_user!
    if current_user.user? then
      render :file => "public/401.html", :status => :not_authoerized
    end
  end

  def superadmins_only
    authenticate_user!
    if !current_user.superadmin? then
      render :file => "public/401.html", :status => :not_authoerized
    end
  end

  def operators_only
    authenticate_user!
    unless current_user.superadmin? || current_user.operator? then
      render :file => "public/401.html", :status => :not_authoerized
    end
  end


=begin
  def authenticate_user!
    if user_signed_in? then
      super
    else
      redirect_to user_omniauth_authorize_path(:facebook), :notice => 'Please login before continue'
    end
  end
=end
end
