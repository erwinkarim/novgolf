class Monolith::MonolithController < ApplicationController
  before_action :superadmins_only
  
  def index
  end
end
