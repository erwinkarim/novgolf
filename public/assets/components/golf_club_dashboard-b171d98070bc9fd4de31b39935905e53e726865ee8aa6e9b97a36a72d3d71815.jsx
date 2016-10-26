var GolfClubDashStatus = React.createClass({
  propTypes:{
    status:React.PropTypes.string,
    flightsArray: React.PropTypes.array, days: React.PropTypes.array,
    selectedArray: React.PropTypes.number, selectedFlight: React.PropTypes.number,
    loadFlight: React.PropTypes.bool
  },
  getDefaultProps: function(){
      return {status:'Nothing Selected'};
  },
  componentDidMount:function(){
    $(this.refs.dashStatus).sticky({topSpacing:10});
  },
  render:function(){
    //load the flight info if booked, default is null
    var flightInfo = (<div>No Flights Selected</div>);
    if(this.props.loadFlight){
      var flight = this.props.flightsArray[this.props.selectedArray][this.props.selectedFlight];
      flightInfo = (
        <div>
          <ReserveFormPage flight={flight} flightInfo={ this.props.flightInfo } isActive={true} updatePrice={this.props.updatePax }
            selectCourse={this.props.selectCourse} options={this.props.options} />
          <h4>Tax: {toCurrency(parseFloat(this.props.flightInfo.tax))}</h4>
          <h3>Total: {toCurrency(parseFloat(this.props.flightInfo.totalPrice))} </h3>
        </div>
      )
    };

    return(
      <div className="card" id="dashStatus" ref="dashStatus" style={ {background:'papayawhip'} }>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">{this.props.status}</li>
          <li className="list-group-item">{ flightInfo }</li>
          <li className="list-group-item">
            <button className="btn btn-secondary" type="button">Reserve</button>
            <button className="btn btn-secondary" type="button">Cancel</button>
            <button className="btn btn-secondary" type="button">Move</button>
            <button className="btn btn-secondary" type="button">Update</button>
          </li>
        </ul>
      </div>
    );
  }
});

var GolfClubDashboard = React.createClass({
  propTypes: {
      club:React.PropTypes.object,
      paths:React.PropTypes.object
  },
  getInitialState: function(){
    var today = new Date();
    var queryDate = today.getDate() + '/' + (today.getMonth()+1) + '/' + today.getFullYear();

    return {
      flightsArray:[], dashBoardStatusText:null,
      days: this.updateDays(today), queryDate:queryDate,
      loadFlight: false, selectedFlight:null,
      flightInfo:{pax:0, buggy:0, caddy:0, insurance:0, tax:0.00, totalPrice:0.00}
    }
  },
  getDefaultProps: function(){
      return { options: {displayCourseGroup:true}};
  },
  updateDays: function(newDate){
    //new Date must be type Date
    //console.log("updating days array from", newDate);
    days = arrayFromRange(0,6).map( (e,i) => {
        newDay = new Date();
        newDay.setDate(newDate.getDate() + e);
        return newDay.getDate() + '/' + (newDay.getMonth() + 1) + '/' + newDay.getFullYear();
    });
    return days;
    //this.setState({days:days});
  },
  loadSchedule: function(){

    var handle = this;
    this.state.days.map( (e,i) => {
      $.getJSON(handle.props.paths.club_path, {date:e}, function(data){
        var newFlightsArray = handle.state.flightsArray;
        newFlightsArray[i] = data.flights;
        handle.setState({flightsArray:newFlightsArray});
      });
    });

  },
  loadReservationJSON: function(reservation_id, currentFlightInfo){
    var handle = this;
    if(reservation_id != null){
      $.getJSON(`${handle.props.paths.user_reservations}/${reservation_id}`, null, function(data){
        //update flight info from data in user_reservations
        var reserve = data.user_reservation;
        var newFlightInfo = Object.assign(currentFlightInfo,
          {pax:reserve.count_pax, buggy:reserve.count_buggy, caddy:reserve.count_caddy,
            insurance:reserve.count_insurance, tax:reserve.actual_tax, totalPrice:reserve.total_price});
        handle.setState({flightInfo:newFlightInfo});
      });
    }
  },
  dateChanged: function(dateText){
    //console.log('date changed to', dateText);
    if(dateText != this.state.days[0]){
      this.setState({days: this.updateDays(new Date(dateText)),
        loadFlight:false,selectedArray:null, selectedFlight:null
      });
      $('.btn-group').find('.active').toggleClass('active');
      this.loadSchedule();
    }

  },
  updatePax: function(e){
    //console.log("handle price updates, etc for", e.target);
    var newFlightInfo = this.state.flightInfo;
    var flight = this.state.flightsArray[this.state.selectedArray][this.state.selectedFlight];

    newFlightInfo[e.target.dataset.target] = e.target.value;

    //update the insurance count automatically if insurance mode is madatory
    if(($.inArray(flight.prices.insurance_mode,[1,2]) != -1) &&
      (e.target.dataset.target == 'pax') ){
        newFlightInfo.insurance = parseInt(e.target.value);
    }
    newFlightInfo = this.updatePrice(newFlightInfo, flight);

    this.setState({flightInfo:newFlightInfo});
  },
  selectCourse: function(e){
    //load and update the course info when selected
    console.log("selected course id", e.target.dataset.courseId);
    console.log("should load user_reservation", e.target.dataset.reservationId)
    this.loadReservationJSON(e.target.dataset.reservationId, this.state.flightInfo);
  },
  updatePrice: function(newFlightInfo, flight){
    //var flight = this.state.flightsArray[this.state.selectedArray][this.state.selectedFlight];
    var total = (flight.prices.flight * newFlightInfo.pax) +
      (flight.prices.cart * newFlightInfo.buggy) +
      (flight.prices.caddy * newFlightInfo.caddy) +
      (flight.prices.insurance * newFlightInfo.insurance) ;

    newFlightInfo.tax = this.props.club.tax_schedule.rate * total;
    newFlightInfo.totalPrice = total + newFlightInfo.tax;

    return newFlightInfo;

  },
  handleClick: function(e){
    var handle = this;
    //console.log('button clicked', e.target.dataset);

    //if array changed, reset active class on the previous array
    if(parseInt(e.target.dataset.arrayindex) != this.state.selectedArray){
      $($('.btn-group')[this.state.selectedArray]).find('.active').toggleClass('active');
    };

    //setup the dashboard status
    var newDashText = this.state.days[e.target.dataset.arrayindex] + ", "
      + this.state.flightsArray[e.target.dataset.arrayindex][e.target.dataset.value].tee_time;

    var flight = this.state.flightsArray[e.target.dataset.arrayindex][e.target.dataset.value];
    //todo: need to handle cases where the flight has already been reserved
    var newFlightInfo = {pax:flight.minPax, buggy:flight.minCart, caddy:flight.minCaddy, insurance:0, tax:0.00, totalPrice:0.00};
    newFlightInfo = this.updatePrice(newFlightInfo, flight);

    //load user_reservations info if necessary
    this.loadReservationJSON(flight.user_reservation_id, newFlightInfo);
    /*
    if(flight.user_reservation_id != null){
        $.getJSON(`${handle.props.paths.user_reservations}/${flight.user_reservation_id}`, null, function(data){
          //update flight info from data in user_reservations
          var reserve = data.user_reservation;
          newFlightInfo = Object.assign(newFlightInfo,
            {pax:reserve.count_pax, buggy:reserve.count_buggy, caddy:reserve.count_caddy,
              insurance:reserve.count_insurance, tax:reserve.actual_tax, totalPrice:reserve.total_price});
          handle.setState({flightInfo:newFlightInfo});
        });
    }
    */

    //setup the state
    this.setState({
      dashBoardStatusText:newDashText,
      selectedArray:parseInt(e.target.dataset.arrayindex), selectedFlight: parseInt(e.target.dataset.value), loadFlight:true,
      flightInfo:newFlightInfo
    });
  },
  componentDidMount:function(){
    var handle = this;
    $(this.refs.datepicker).datepicker({
      dateFormat:'dd/M/yy',
      altFormat:'mm/dd/yy',
      onClose:function(dateText){ handle.dateChanged(dateText); }
    });

    this.loadSchedule();
  },
  render: function(){
    return (
      <div className="row">
        <div className="col-lg-8">
          <input className="datepicker" ref="datepicker" type="text" defaultValue={this.state.queryDate} style={ {zIndex:100, position:'relative'}}/>
          { this.state.flightsArray.map( (e,i) => {
            return (
              <div key={i} >
                <strong>{this.state.days[i]}</strong>
                <GolfCardTimesGroup flights={e} btnGroupMode="radio" handleClick={this.handleClick} arrayIndex={i} adminMode={true} />
              </div>
            );
          })}
        </div>
        <div className="col-lg-4">
          <GolfClubDashStatus status={this.state.dashBoardStatusText} loadFlight={this.state.loadFlight}
            flightsArray={this.state.flightsArray} selectedArray={this.state.selectedArray} selectedFlight={this.state.selectedFlight}
            selectCourse={this.selectCourse}
            days={this.state.days} updatePax={this.updatePax} flightInfo={this.state.flightInfo} options={this.props.options}/>
        </div>
      </div>
    )
  }
});
