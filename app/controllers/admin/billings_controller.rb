class Admin::BillingsController < ApplicationController
  before_action :admins_only
  
  def index
  end

  def settings
  end
end
