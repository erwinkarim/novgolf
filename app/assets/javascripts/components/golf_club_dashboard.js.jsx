var GolfClubDashStatus = React.createClass({
  propTypes:{
    status:React.PropTypes.string,
    flightsArray: React.PropTypes.array, days: React.PropTypes.array,
    selectedArray: React.PropTypes.number, selectedFlight: React.PropTypes.number, selectedCourse: React.PropTypes.number,
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
            selectCourse={this.props.selectCourse} options={this.props.options} selectedCourse={this.props.selectedCourse} />
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
            <button className="btn btn-secondary" type="button" disabled={disableFnBtn} onClick={this.props.reservationConfirm}>Confirm</button>
            <button className="btn btn-danger" type="button" disabled={disableFnBtn} onClick={this.props.reservationCancel}>Cancel</button>
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
  getDefaultProps: function(){
      return { options: {displayCourseGroup:true, GolfClubTimesShowPrices:false}};
  },
  getInitialState: function(){
    var today = new Date();
    var queryDate = today.getDate() + '/' + (today.getMonth()+1) + '/' + today.getFullYear();

    return {
      flightsArray:[], dashBoardStatusText:null,
      days: this.updateDays(today), queryDate:queryDate,
      loadFlight: false, selectedArray:null, selectedFlight:null, selectedCourse:null,
      flightInfo:{pax:0, member:0, buggy:0, caddy:0, insurance:0, tax:0.00, totalPrice:0.00},
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

    newFlightInfo = flightFunctions.updateCount(e, newFlightInfo, flight);
    newFlightInfo = this.updatePrice(newFlightInfo, flight);

    /*
    newFlightInfo[e.target.dataset.target] = e.target.value;

    //update the insurance count automatically if insurance mode is madatory
    if(($.inArray(flight.prices.insurance_mode,[1,2]) != -1) &&
      (e.target.dataset.target == 'pax') ){
        newFlightInfo.insurance = parseInt(e.target.value);
    }
    */

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
      this.setState({flightInfo:newFlightInfo, selectedCourse:parseInt(e.target.dataset.index)});

    }else{
      this.loadReservationJSON(e.target.dataset.reservationId, this.state.flightInfo);
      this.setState({selectedCourse:parseInt(e.target.dataset.index)});
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
    var newFlightInfo = {pax:flight.minPax, member:0, buggy:flight.minCart, caddy:flight.minCaddy, insurance:0, tax:0.00, totalPrice:0.00};
    newFlightInfo = this.updatePrice(newFlightInfo, flight);

    //load the user_reservation_id for the first course
    //var user_reservation_id = Math.min.apply(null, flight.course_data.courses.map((e,i) => e.reservation_id) );
    var user_reservation_id = flight.course_data.courses[0].reservation_id;
    if(user_reservation_id){
      this.loadReservationJSON(user_reservation_id, newFlightInfo);
    };

    //setup the state
    this.setState({
      dashBoardStatusText:newDashText,
      selectedArray:parseInt(e.target.dataset.arrayindex), selectedFlight: parseInt(e.target.dataset.value), selectedCourse:0, loadFlight:true,
      flightInfo:newFlightInfo
    });
  },
  reservationUpdate: function(e){
    var handle = this;
    var flight = this.state.flightsArray[this.state.selectedArray][this.state.selectedFlight];
    if("courses" in flight.course_data){
      var course = flight.course_data.courses[this.state.selectedCourse];
      if(course.reservation_id){
        $.ajax(`${this.props.paths.user_reservations}/${course.reservation_id}`,{
          method:"PATCH",
          data: { flight_info: this.state.flightInfo },
          dataType:'json',
          success: function(data){
            $.snackbar({content:data.message});
            handle.loadSchedule();
          }
        });
      };
    };
  },
  reservationCancel: function(e){
    //check if course is there
    var flight = this.state.flightsArray[this.state.selectedArray][this.state.selectedFlight];
    var handle = this;
    if("courses" in flight.course_data){
      var course = flight.course_data.courses[this.state.selectedCourse];
      if(course.reservation_id){
        console.log("cancel reservation ", course.reservation_id);
        $.ajax(`${this.props.paths.user_reservations}/${course.reservation_id}`,{
          method:"DELETE",
          dataType:'json',
          success: function(data){
            $.snackbar({content:data.message});
            handle.loadSchedule();
          }
        });
      };
    };


  },
  reservationNew: function(e){
    console.log("new reservation");

    var handle = this;
    var flight = this.state.flightsArray[this.state.selectedArray][this.state.selectedFlight];

    $.ajax(this.props.paths.user_reservations, {
      data: {
        golf_club_id:this.props.club.id, booking_date:this.state.days[this.state.selectedArray], booking_time:flight.tee_time,
        flight_matrix_id:flight.matrix_id,
        flight_info:this.state.flightInfo
      },
      dataType:'json',
      method:'POST',
      success: function(data){
        $.snackbar({content:data.message});
        handle.loadSchedule();
      },
      error: function(){
        $.snackbar({content:'Failed to reserve Flight'});
      }
    });

  },
  reservationConfirm: function(e){
    var flight = this.state.flightsArray[this.state.selectedArray][this.state.selectedFlight];
    var handle = this;
    if("courses" in flight.course_data){
      var course = flight.course_data.courses[this.state.selectedCourse];
      if(course.reservation_id){
        console.log("confirm reservation", course.reservation_id);
        $.ajax(`${this.props.paths.user_reservations}/${course.reservation_id}/confirm`,{
          method:"POST",
          dataType:'json',
          success: function(data){
            $.snackbar({content:data.message});
            handle.loadSchedule();
          }
        });
      };
    };

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
            flightsArray={this.state.flightsArray}
            selectedArray={this.state.selectedArray} selectedFlight={this.state.selectedFlight} selectedCourse={this.state.selectedCourse}
            selectCourse={this.selectCourse}
            days={this.state.days} updatePax={this.updatePax} flightInfo={this.state.flightInfo} options={this.props.options}
            reservationUpdate={this.reservationUpdate} reservationCancel={this.reservationCancel} reservationNew={this.reservationNew}
            reservationConfirm={this.reservationConfirm}
            />
        </div>
      </div>
    )
  }
});
