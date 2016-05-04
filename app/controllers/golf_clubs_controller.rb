class GolfClubsController < ApplicationController
  def index
    @golf_clubs = GolfClub.all

    respond_to do |format|
      format.tpl
    end
  end

  # POST     /golf_clubs(
  #   Parameters: {
  # "golf_club"=>{"name"=>"", "description"=>"", "address"=>"", "open_hour"=>"10:00am", "close_hour"=>"8:00pm"},
  # "price_sch"=>{"16ddfa6f58f9"=>{"price"=>"", "caddy"=>"", "buddy"=>"", "insurance"=>""}},
  # "flight_sch"=>{"f70c29c0a17d"=>{"days" => ["1", ... , "7"], "times"=>["9:30am"], "min_pax"=>"2", "max_pax"=>"4"}},
  # "submit"=>""}
  def create
    #sanity checks, if ok, then start pump data

    @club = GolfClub.new(:name => params[:golf_club][:name],
      :description => params[:golf_club][:description], :address => params[:golf_club][:address],
      :open_hour => params[:golf_club][:open_hour], :close_hour => params[:golf_club][:close_hour]
    )

    #when creating a new golf club, just allow to make only 1 flight and price schedule
    #new schedules can be added later
    @price_sch = Array.new
    params[:price_sch].each do |key,value|
      @price_sch << ChargeSchedule.new(
        :session_price => value[:price], :caddy => value[:caddy],
        :cart => value[:buddy], :insurance => value[:insurance]
      )
    end

    @flight_sch = Array.new
    @flight_mtx = Array.new
    params[:flight_sch].each do |key,value|
      @flight_sch << FlightSchedule.new( :min_pax => value[:min_pax], :max_pax => value[:max_pax] )
      value[:times].each do |thistime|
        Rails.logger.info "value[:days] is #{value[:days]}"
        @flight_mtx << FlightMatrix.new(value[:days].inject({:tee_time => Time.parse(thistime)}){ |p,n| p.merge({ "day#{n}".to_sym => 1 }) } )
      end
      Rails.logger.info @flight_mtx.inspect
    end

    validate_all = @club.valid? &&
      @price_sch.inject(true){ |p,n| p && n.valid? } &&
      @flight_sch.inject(true){ |p,n| p && n.valid? } &&
      @flight_mtx.inject(true){ |p,n| p && n.valid? }

    if validate_all then
      #start building the golf club
      ActiveRecord::Base.transaction do
        if @club.save! then
          @price_sch.each do |priceSch|
            priceSch.assign_attributes({:golf_club_id => @club.id })
            priceSch.save!
          end

          @flight_sch.each do |flightSch|
            flightSch.assign_attributes({:golf_club_id => @club.id})
            if flightSch.save! then
              @flight_mtx.each do |flightMtx|
                flightMtx.assign_attributes({:flight_schedule_id => flightSch.id})
                flightMtx.save!
              end
            end
          end
        end
      end
      redirect_to golf_club_path(@club)
    else
      flash[:error] = "
        club: #{@club.errors.messages.to_s}, <br />
        price_sch: {#{@price_sch.map{ |x| x.errors.messages.to_s }}} <br />
        flight_sch: { #{@flight_sch.map{ |x| x.errors.messages.to_s }}} <br />
        club: #{@club.inspect}"
      redirect_to :back
    end
  end

  def new
    @club = GolfClub.new
    @charge_schedule = [ChargeSchedule.new]
  end

  def show
    @club = GolfClub.find(params[:id])
  end

  def golf_club_params
    params.require(:golf_club).permit(:name, :description, :address, :open_hour, :close_hour);
  end

end
