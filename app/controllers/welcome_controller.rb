class WelcomeController < ApplicationController
  def index
  end

  # Parameters: {"utf8"=>"✓", "q"=>"", "date"=>"25/05/2016", "time"=>"18:06", "pax"=>"2"}
  def search
    #return base on query
    if params.has_key? :q then
      queryOptions = Hash.new

      #cycle through the params and build the query parameters
      params.keys.each do |thisKey|
        if thisKey == "q" then
          queryOptions = queryOptions.merge({ :query => params[:q]})
        elsif thisKey == "pax" then
          queryOptions = queryOptions.merge({ :pax => params[:pax]})
        elsif (params.has_key?(:time)) || (param.has_key?(:date)) then
          queryOptions = queryOptions.merge({ :dateTimeQuery => Time.parse("#{params[:date]} #{params[:time]} +0000") })
        end
      end
      @clubs = GolfClub.search(queryOptions)
    else
      @clubs = GolfClub.search
    end

    respond_to do |format|
      format.json{ render json:@clubs}
      format.html
    end
  end

  #reset session and other
  def reset
    reset_session
    redirect_to root_path
  end

  def session_data
  end

  def tab_test
    @clubs = GolfClub.search({:dateTimeQuery => Time.parse("07:00 +0800") + 1.day })
  end

  # GET      /suggest(.:format)
  def suggest
    query = params[:q]
    respond_to do |format|
      format.json{
        render json: {
          query:params[:q],
          suggestions:GolfClub.where.has{ upper(name).like "%#{query}%"}.map { |x| {value:x.name, data:x.id}  }
        }
      }
    end
  end
end
