class FlightMatricesController < ApplicationController
  # show in json format what slots are available.
  # if no arguments given, assume that the date is today
  def index
      if params.has_key? :d then
        queryDate = DateTime.parse(params[:d])
      else
        queryDate = Time.now
      end
  end
end
