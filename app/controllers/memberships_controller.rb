class MembershipsController < ApplicationController
  before_action :authenticate_user!, :only => [:create]

  # user_memberships GET      /users/:user_id/memberships(.:format)
  def index
    render json: User.find(params[:user_id]).memberships.map{ |x| x.attributes.merge({club_name: x.club_name})}
  end

  # POST     /users/:user_id/memberships(.:format)
  # update memberships list
  def create
    #sanity checks, can only modify memberships that you own
    if params[:user_id].to_i != current_user.id then
      render json: {message:'You do not own the membership list'}, :status => :unprocessable_entity
      return
    end

    #ensure the membership params is there
    unless params.has_key? :memberships then
      render json: {message:'memberships list not found'}, :status => :unprocessable_entity
      return
    end

    #set the new memberships state
    current_user.set_memberships params[:memberships]

    render json: {message:'message received from server'}
  end
end
