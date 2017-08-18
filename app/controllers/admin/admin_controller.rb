class Admin::AdminController < ApplicationController
  before_action :admins_only
  def index
  end
end
