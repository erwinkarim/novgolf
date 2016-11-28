class MembershipsController < ApplicationController
  # user_memberships GET      /users/:user_id/memberships(.:format)
  def index
    render json: User.find(params[:user_id]).memberships
  end
end
