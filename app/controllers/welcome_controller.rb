class WelcomeController < ApplicationController
  def index
  end

  def search
    #return base on query
    if params.has_key? :q then
      query = params[:q]
      @clubs = GolfClub.where{ name.like "%#{query}%" }
    else
      @clubs = GolfClub.all
    end
  end
end
