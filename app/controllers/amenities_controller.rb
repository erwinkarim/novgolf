class AmenitiesController < ApplicationController
  def index
    respond_to do |format|
      format.json{
        render json:Amenity.all.map{ |x| {name:x.name, label:x.label}}
      }
    end
  end
end
