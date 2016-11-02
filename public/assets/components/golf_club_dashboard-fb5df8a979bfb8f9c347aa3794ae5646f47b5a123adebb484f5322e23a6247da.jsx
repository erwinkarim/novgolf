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
    var disableFnBtn = true;
    if(this.props.loadFlight){
      disableFnBtn = false;
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
            <button className="btn btn-secondary" type="button" disabled={disableFnBtn} onClick={this.props.reservationNew}>Reserve</button>
            <button className="btn btn-secondary" type="button" disabled={disableFnBtn} onClick={this.props.reservationCancel}>Cancel</button>
            <button className="btn btn-secondary" type="button" disabled={disableFnBtn} onClick={this.props.reservationUpdate}>Update</button>
          </li>
        </ul>
      </div>
    );
  }
});

var GolfClubDashboard = React.createClass({
  propTypes: {
      club:React.PropTypes.object,
      token:React.PropTypes.string,
      paths:React.PropTypes.object
  },
  getInitialState: function(){
    var today = new Date();
    var queryDate = today.getDate() + '/' + (today.getMonth()+1) + '/' + today.getFullYear();

    return {
      flightsArray:[], dashBoardStatusText:null,
      days: this.updateDays(today), queryDate:queryDate,
      loadFlight: false, selectedFlight:null,
      flightInfo:{pax:0, buggy:0, caddy:0, insurance:0, tax:0.00, totalPrice:0.00},
      tick:60
    }
  },
  tick: function(){
    //reload the schedule every 60-90 seconds
    var newTick = this.state.tick - 1;
    if(newTick == 0){
      newTick = 60;
      this.loadSchedule();
    };
    this.setState({tick:newTick});
  },
  getDefaultProps: function(){
      return { options: {displayCourseGroup:true, GolfClubTimesShowPrices:false}};
  },
  updateDays: function(newDate){
    //new Date must be type Date
    days = arrayFromRange(0,6).map( (e,i) => {
      var newDay = new Date(newDate.getTime() + (60*60*24*1000*e));
      return newDay.getDate() + '/' + (newDay.getMonth() + 1) + '/' + newDay.getFullYear();
    });
    return days;
  },
  loadSchedule: function(){

    var handle = this;
    this.state.days.map( (e,i) => {
      $.getJSON(handle.props.paths.club_path, {date:e, loadcoursedata:true}, function(data){
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
        loadFlight:false,selectedArray:null, selectedFlight:null, tick:60
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
    //console.log("selected course id", e.target.dataset.courseId);
    //console.log("should load user_reservation", e.target.dataset.reservationId)
    if (e.target.dataset.reservationId == null){
      //if there's no reservation ID, update flightInfo to default values
      var flight = this.state.flightsArray[this.state.selectedArray][this.state.selectedFlight];
      var newFlightInfo = {pax:flight.minPax, buggy:flight.minCart, caddy:flight.minCaddy, insurance:0, tax:0.00, totalPrice:0.00};
      newFlightInfo = this.updatePrice(newFlightInfo, flight);
      this.setState({flightInfo:newFlightInfo});

    }else{
      this.loadReservationJSON(e.target.dataset.reservationId, this.state.flightInfo);

    }
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
  reservationUpdate: function(e){
    console.log("update reservation");
  },
  reservationCancel: function(e){
    console.log("cancel reservation");

  },
  reservationNew: function(e){
    console.log("new reservation");

    $.post(this.props.paths.user_reservations, {}, function(data){
      //reload the schedule if reservation successful
    },'json' );
    $.ajax(this.props.paths.user_reservations, {
      data: {},
      dataType:'json',
      method:'POST',
      success: function(data){
        $.snackbar({content:'New Reservation'});
      },
      error: function(){
        $.snackbar({content:'Failed to reserve Flight'});
      }
    });

  },
  componentDidMount:function(){
    var handle = this;
    $(this.refs.datepicker).datepicker({
      dateFormat:'dd/M/yy',
      altFormat:'mm/dd/yy',
      onClose:function(dateText){ handle.dateChanged(dateText); }
    });
    this.interval = setInterval(this.tick, 1000);

    this.loadSchedule();
  },
  componentWillUnmount: function(){
      clearInterval(this.interval);
  },
  render: function(){
    return (
      <div className="row">
        <div className="col-lg-8">
          <p>
            <input className="datepicker form-control" ref="datepicker"
              type="text" defaultValue={this.state.queryDate} style={ {zIndex:100, position:'relative'}}/>
            Refresh in {this.state.tick} seconds...
          </p>
          { this.state.flightsArray.map( (e,i) => {
            return (
              <div key={i} >
                <strong>{this.state.days[i]}</strong>
                <GolfCardTimesGroup flights={e} btnGroupMode="radio" handleClick={this.handleClick}
                  arrayIndex={i} adminMode={true} options={this.props.options} />
              </div>
            );
          })}
        </div>
        <div className="col-lg-4">
          <GolfClubDashStatus status={this.state.dashBoardStatusText} loadFlight={this.state.loadFlight}
            flightsArray={this.state.flightsArray} selectedArray={this.state.selectedArray} selectedFlight={this.state.selectedFlight}
            selectCourse={this.selectCourse}
            days={this.state.days} updatePax={this.updatePax} flightInfo={this.state.flightInfo} options={this.props.options}
            reservationUpdate={this.reservationUpdate} reservationCancel={this.reservationCancel} reservationNew={this.reservationNew}
            />
        </div>
      </div>
    )
  }
});
