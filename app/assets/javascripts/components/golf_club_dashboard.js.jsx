var GolfClubDashStatistics = React.createClass({
  propTypes:{
    flightsArray:React.PropTypes.array, days:React.PropTypes.array
  },
  getInitialState(){
    return { coursesBooked:0, coursesTotal:0, revenue:0}
  },
  componentDidMount: function(){
    this.checkCourseStats(this.props);
  },
  componentWillReceiveProps(nextProps){
    this.checkCourseStats(nextProps);
  },
  checkCourseStats: function(theProps){
    //get the courses Count
    var handle = this;
    var courseCount = 0;
    var bookedCourse = 0;
    var reservation_ids = [];

    if(theProps != undefined){
      // get the course count / booked courses
      theProps.flightsArray.map( (day,i) => {
        //this is each day
        day.map( (flight, flight_index) => {
          flight.course_data.courses.map((course, course_index) =>  {
            courseCount += 1;
            if(course.reservation_id != null){
              bookedCourse += 1;
              reservation_ids.push(course.reservation_id);
            }
          });
        });
      });

      //get the revenue generated
      fetch('/admin/user_reservations/stats', {
        credentials: 'same-origin',
        method:'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_list:reservation_ids,
          authenticity_token:this.props.token
        })
      }).then(function(response){
        return response.json();
      }).then(function(json){
        handle.setState({revenue:json.revenue});
      });

    }

    this.setState({coursesBooked:bookedCourse, coursesTotal:courseCount});
  },
  render: function(){
    //calculate couses booked / availabled course

    return (
      <div>
        <h3>Stats</h3>
        <p>Duration: {this.props.days[0]} to {this.props.days[6]}</p>
        <p>Courses: {this.state.coursesBooked}/{this.state.coursesTotal} </p>
        <progress className="progress" value={this.state.coursesBooked} max={this.state.coursesTotal}>
          <div className="progress">
            <span className="progress-bar" style={{width:`${this.state.coursesBooked/this.state.coursesTotal*100}%`}}></span>
          </div>
        </progress>
        <p>Revenue: {toCurrency(parseFloat(this.state.revenue))}</p>
      </div>
    );
  }
});

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
  toggleChevron: function(){
    $(this.refs.chevron).toggleClass('fa-angle-double-up');
    $(this.refs.chevron).toggleClass('fa-angle-double-down');
  },
  render:function(){
    //load the flight info if booked, default is null
    var flightInfo = null;
    var btnRow = null;
    var toggleReservationPanel = this.props.status == null ? null : (
      <a onClick={this.toggleChevron} data-toggle="collapse" href="#reservationCollapse"><i ref="chevron" className="fa fa-angle-double-up"></i></a>
    );
    var disableFnBtn = true;

    var outstandingModalLink = this.props.flightTransaction == null ? <span>Outstanding</span> : (
      <a href="#ur-transaction-modal" data-toggle="modal">Outstanding</a>
    );

    if(this.props.loadFlight){
      disableFnBtn = false;
      var flight = this.props.flightsArray[this.props.selectedArray][this.props.selectedFlight];
      var outstanding_value = this.props.flightTransaction == null ? toCurrency(0.0) : toCurrency(parseFloat(this.props.flightTransaction.outstanding));

      //<button className="btn btn-secondary" type="button" disabled={disableFnBtn} onClick={this.props.reservationConfirm}>Confirm</button>
      btnRow = (
        <div>
          <button className="btn btn-secondary" type="button" disabled={disableFnBtn} onClick={this.props.reservationNew}>Reserve</button>
          <button className="btn btn-secondary" type="button" disabled={disableFnBtn} onClick={this.props.reservationUpdate}>Update</button>
          <button className="btn btn-danger" type="button" disabled={disableFnBtn} onClick={this.props.reservationCancel}>Cancel</button>
        </div>
      );
      flightInfo = (
        <div>
          <ReserveFormPage flight={flight} flightInfo={ this.props.flightInfo } isActive={true} updatePrice={this.props.updatePax }
            selectCourse={this.props.selectCourse} options={this.props.options} selectedCourse={this.props.selectedCourse}
            updateMembersList={this.props.updateMembersList} />
          <h4>Tax: {toCurrency(parseFloat(this.props.flightInfo.tax))}</h4>
          <h3>Total: {toCurrency(parseFloat(this.props.flightInfo.totalPrice))} </h3>
          <h4>{outstandingModalLink}: {outstanding_value}</h4>
        </div>
      )
    };

    return(
      <div className="card" id="dashStatus" ref="dashStatus" style={ {background:'papayawhip'} }>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            <h3>Flight <small>{toggleReservationPanel}</small></h3>
            <div className="collapse in" id="reservationCollapse">
              <p>Selected: {this.props.status}</p>
              { flightInfo }
              { btnRow }
            </div>
          </li>
          <li className="list-group-item">
            {this.props.dashStats}
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
      paths:React.PropTypes.object,
      refreshEvery:React.PropTypes.number
  },
  getDefaultProps: function(){
      return { options: {displayCourseGroup:true, GolfClubTimesShowPrices:false, displayMembersModal:true}, refreshEvery:60};
  },
  getInitialState: function(){
    var today = new Date();
    var queryDate = today.getDate() + '/' + (today.getMonth()+1) + '/' + today.getFullYear();

    return {
      flightsArray:[], dashBoardStatusText:'None Selected',
      days: this.updateDays(today), queryDate:queryDate,
      loadFlight: false, selectedArray:null, selectedFlight:null, selectedCourse:null,
      flightInfo:{pax:0, member:0, buggy:0, caddy:0, insurance:0, tax:0.00, totalPrice:0.00, members:[]},flightTransaction:null,
      cashValue:0.0
    }
  },
  tick: function(){
    //reload the schedule every 60 seconds
    //later update to pub-sub
    this.loadSchedule();
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
    var newFlightsArray = this.state.flightsArray;

    //asynch issues, need to use promise to send and collect
    //or update the controller to load the next 7 days instead
    fetch(`${handle.props.paths.club_path}/flights.json?` + $.param({date:this.state.days[0], loadcoursedata:true}), {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json'}
    }).then(function(response){
      return response.json()
    }).then(function(data){
      var newFlightsArray = handle.state.flightsArray;
      data.map( (search_result, index) => {
        newFlightsArray[index] = search_result.flights;
      });
      handle.setState({flightsArray:newFlightsArray});

      //auto load transactions if course selected
      if(handle.state.selectedCourse == null){
        console.log('handle.selectedCourse was null');
        return 0;
      };

      var reservation_id = handle.state.flightsArray[handle.state.selectedArray][handle.state.selectedFlight].course_data.courses[handle.state.selectedCourse].reservation_id;
      if(reservation_id == null){
        console.log('reservation_id was null');
        return 0;
      };

      fetch(`${handle.props.paths.user_reservations}/${reservation_id}/ur_transactions`,{
        credentials:'same-origin'
      }).then( function(response){
        return response.json();
      }).then(function(json){
        handle.setState({flightTransaction:json});
      });
    });
  },
  loadReservationJSON: function(reservation_id, currentFlightInfo){
    var handle = this;
    if(reservation_id != null){
      //get reservation info
      $.getJSON(`${handle.props.paths.user_reservations}/${reservation_id}`, null, function(data){
        //update flight info from data in user_reservations
        var reserve = data.user_reservation;
        var newFlightInfo = Object.assign(currentFlightInfo,
          {pax:reserve.count_pax, member:reserve.count_member, buggy:reserve.count_buggy, caddy:reserve.count_caddy,
            insurance:reserve.count_insurance, tax:reserve.actual_tax, totalPrice:reserve.total_price, members:reserve.ur_member_details});
        handle.setState({flightInfo:newFlightInfo});
      });

      $.getJSON(`${handle.props.paths.user_reservations}/${reservation_id}/ur_transactions`, null, function(data){
        handle.setState({flightTransaction:data});
      });

      //get reservation transactions
    }
  },
  dateChanged: function(dateText){
    //console.log('date changed to', dateText);
    if(dateText != this.state.days[0]){
      this.setState({days: this.updateDays(new Date(dateText)),
        loadFlight:false,selectedArray:null, selectedFlight:null, tick:60,
        dashBoardStatusText:'None Selected'
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
      var newFlightInfo = {pax:flight.minPax, member:0, buggy:flight.minCart, caddy:flight.minCaddy, insurance:0,
        tax:0.00, totalPrice:0.00, members:[]};
      newFlightInfo = this.updatePrice(newFlightInfo, flight);
      this.setState({flightInfo:newFlightInfo, selectedCourse:parseInt(e.target.dataset.index), flightTransaction:null});

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
    //happens when i click on a flight time

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
    var newFlightInfo = {pax:flight.minPax, member:0, buggy:flight.minCart, caddy:flight.minCaddy, insurance:0, members:[], tax:0.00, totalPrice:0.00};
    newFlightInfo = this.updatePrice(newFlightInfo, flight);

    //load the user_reservation_id for the first course
    //var user_reservation_id = Math.min.apply(null, flight.course_data.courses.map((e,i) => e.reservation_id) );
    var user_reservation_id = flight.course_data.courses[0].reservation_id;
    if(user_reservation_id){
      this.loadReservationJSON(user_reservation_id, newFlightInfo);
    } else {
      this.setState({flightTransaction:null});
    };

    //setup the state
    this.setState({
      dashBoardStatusText:newDashText,
      selectedArray:parseInt(e.target.dataset.arrayindex),
      selectedFlight: parseInt(e.target.dataset.value), selectedCourse:0, loadFlight:true,
      flightInfo:newFlightInfo
    });
  },
  updateMembersList: function(e){
    var membersArray = $(this.refs.memberBody).serializeArray();

    //need to massage the data into [ {name:, member_id: , id:}, {...}] format
    //at least it will be in 3s
    var newMemberInfo = [];
    var inputIndex = 0;
    var memberInfo = {name:'', member_id:'', id:0};

    membersArray.forEach( function(e){
      switch (inputIndex) {
        case 0:
          inputIndex += 1;
          memberInfo.id = e.value;
          break;
        case 1:
          inputIndex += 1;
          memberInfo.name = e.value;
          break;
        case 2:
          inputIndex += 1;
          memberInfo.member_id = e.value;
          newMemberInfo.push( Object.assign({}, memberInfo) ) ;
          inputIndex = 0;
          break;
        default:
          //do nothing
      }
    });

    //update the members state
    var newFlightInfo = this.state.flightInfo;
    newFlightInfo.members = newMemberInfo;
    this.setState( {flightInfo:newFlightInfo});

    //dismiss the modal
    var dismissModal = typeof e.target.dataset.dismissModal == "undefined" ? true : (e.target.dataset.dismissModal === 'true');
    if(dismissModal){
      $(this.refs.membersModal).modal('hide');
    }
  },
  reservationUpdate: function(e){
    var handle = this;
    var flight = this.state.flightsArray[this.state.selectedArray][this.state.selectedFlight];
    if("courses" in flight.course_data){
      var course = flight.course_data.courses[this.state.selectedCourse];
      if(course.reservation_id){
        fetch(`${this.props.paths.user_reservations}/${course.reservation_id}`,{
          method:'PATCH',
          credentials:'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body:JSON.stringify({ authenticity_token:this.props.token, flight_info: this.state.flightInfo })
        }).then(function(response){
          if(response.status >= 200 && response.status < 300){
            return response.json();
          } else {
            throw response.json();
          }
        }).then(function(json){
          $.snackbar({content:json.message});
          handle.loadSchedule();
        }).catch(function(error){
          console.log("error", error);
          $.snackbar({content:"Unable to Update Reservation"});
        });

        /*
        $.ajax(`${this.props.paths.user_reservations}/${course.reservation_id}`,{
          method:"PATCH",
          data: { flight_info: this.state.flightInfo },
          dataType:'json',
          success: function(data){
            $.snackbar({content:data.message});
            handle.loadSchedule();
          }
        });
        */
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
            //set the flight transaction to null to kill the outstanding modal link
            handle.setState({flightTransaction:null});
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

    //sanity check. ensure that members + id field are populated before updating it
    if(this.state.flightInfo.members.length > 0 &&
      Math.max(...this.state.flightInfo.members.map( (member, i) => { return member.name == "" || member.member_id == "" }))
    ){
      $.snackbar({content:'Some ID/Members is not populated'});
      return;
    };

    //change to fetch
    //get the updated ur_transactions info
    fetch(this.props.paths.user_reservations,{
      method:'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body:JSON.stringify({
        authenticity_token:this.props.token,
        golf_club_id:this.props.club.id, booking_date:this.state.days[this.state.selectedArray], booking_time:flight.tee_time,
        flight_matrix_id:flight.matrix_id, flight_info:this.state.flightInfo
      })
    }).then( function(response){
      return response.json();
    }).then(function(data){
      $.snackbar({content:data.message});
      handle.loadSchedule();
    }).catch(function(ex){
      $.snackbar({content:'Failed to reserve Flight'});
      console.log("exception", ex);
    });
  },
  reservationConfirm: function(e){
    var flight = this.state.flightsArray[this.state.selectedArray][this.state.selectedFlight];
    var handle = this;
    if("courses" in flight.course_data){
      var course = flight.course_data.courses[this.state.selectedCourse];
      if(course.reservation_id){
        console.log("make payment for reservation", course.reservation_id);
        var payment_amount = parseFloat(e.target.dataset.paymentMethod == "cc" ? handle.state.flightTransaction.outstanding : handle.state.cashValue);
        fetch(`${this.props.paths.user_reservations}/${course.reservation_id}/pay`,{
          method:'POST',
          credentials:'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body:JSON.stringify({
            authenticity_token:this.props.token,
            flight_info:this.state.flightInfo, payment_method:e.target.dataset.paymentMethod, payment_amount:payment_amount})
        }).then(function(response){
          return response.json()
        }).then(function(json){
          $.snackbar({content:json.message});
          handle.loadSchedule();
        });
      };
    };

  },
  reservationConfirmMembers: function(e){
    e.preventDefault();
    var handle = this;


    //update the flight members and it's state
    var p1 = new Promise(function(resolve,reject){
      handle.updateMembersList(e);
      resolve();
    });

    p1.then(function(val){
      console.log('send msg to confirm members inside promise');
      //send info about flight updates and refresh the
      var reservation_id = handle.state
        .flightsArray[handle.state.selectedArray][handle.state.selectedFlight]
        .course_data.courses[handle.state.selectedCourse].reservation_id;
      fetch(`${handle.props.paths.user_reservations}/${reservation_id}/confirm_members`, {
        method:'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify({
          authenticity_token:handle.props.token
        })
      }).then(function(response){
        return response.json();
      }).then(function(json){
        console.log('member list verified');
        $.snackbar({content:json.message});
        handle.loadSchedule();
      });

    }).catch(
      function(reason){
        $.snackbar({content:'Unable to verify member list'});
      }
    );

    $(handle.refs.membersModal).modal('hide');

  },
  updateCashValue: function(e){
    this.setState({cashValue:e.target.value});
  },
  refreshNow: function(e){
    e.preventDefault();
    this.loadSchedule();
  },
  componentDidMount:function(){
    var handle = this;

    //setup the datepicker
    $(this.refs.datepicker).datepicker({
      dateFormat:'dd/M/yy',
      altFormat:'mm/dd/yy',
      onClose:function(dateText){ handle.dateChanged(dateText); }
    });

    //update every refreshEvery seconds
    this.interval = setInterval(this.tick, this.props.refreshEvery * 1000);

    //finally, load the damn schedule
    this.loadSchedule();

  },
  componentWillUnmount: function(){
      clearInterval(this.interval);
  },
  render: function(){
    //var membersModal = (this.props.options.displayMembersModal) ? (
    //handle initial cases when selectedArray is not loaded yet
    var modalMinMember = 0;
    var modalMaxMember = 5;

    var dashStats = (<GolfClubDashStatistics flightsArray={this.state.flightsArray} days={this.state.days} token={this.props.token} />);

    if(this.state.selectedArray != null){
        modalMinMember = this.state.flightsArray[this.state.selectedArray][this.state.selectedFlight].minPax;
        modalMaxMember = this.state.flightsArray[this.state.selectedArray][this.state.selectedFlight].maxPax;
    };

    var enableVerifyMemberLink = this.state.selectedArray == null ? false : (
      this.state.flightsArray[this.state.selectedArray][this.state.selectedFlight]
      .course_data.courses[this.state.selectedCourse].reservation_status == 8
    );

    //TODO: make the membersModal another component
    var membersModal = true ? (
      <div id="membersModal" ref="membersModal" className="modal fade" data-backdrop="static" data-keyboard="false">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" onClick={this.updateMembersList}>&times;</button>
              <h4 className="modal-title">Members List</h4>
            </div>
            <div className="modal-body">
              <form action="/" className="container-fluid" ref="memberBody">
                { this.state.flightInfo.members.map( (e,i) => {
                  var random_id = randomID();
                  return (
                    <div key={i} ref="memberInfo" className="form-group row">
                      <input type="hidden"  name={`members[${random_id}][id]`} defaultValue={this.state.flightInfo.members[i].id} />
                      <div className="col-sm-5">
                        <input type="text" className="form-control" name={`members[${random_id}][name]`}
                          defaultValue={this.state.flightInfo.members[i].name } placeholder="Member Name"/>
                      </div>
                      <div className="col-sm-5">
                        <input type="text" className="form-control" name={`members[${random_id}][member_id]`}
                          defaultValue={this.state.flightInfo.members[i].member_id} placeholder="Member ID"/>
                      </div>
                      <div className="col-sm-2">
                        <button className="btn btn-danger" onClick={this.updatePax}
                          value={this.state.flightInfo.member - 1} data-index={this.state.flightInfo.index} data-target="member"
                          disabled={this.state.flightInfo.member + this.state.flightInfo.pax == modalMinMember}
                          tabIndex="-1"
                        >
                          <i className="fa fa-minus"></i>
                        </button>
                      </div>
                    </div>
                  )}
                )}
                <div className="form-group row">
                  <div className="col-sm-12">
                    <button className="btn btn-primary" onClick={this.updatePax}
                      type="button"
                      value={this.state.flightInfo.member + 1} data-index={this.state.flightInfo.index} data-target="member"
                      disabled={this.state.flightInfo.member ==
                        this.state.selectedArray ==  modalMaxMember }
                    >
                      <i className="fa fa-plus"></i>
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <div className="btn-group">
                <button type="button" className="btn btn-primary" onClick={this.updateMembersList}>Update Members</button>
                <button type="button" className="btn btn-primary dropdown-toggle dropdown-toggle-split" data-toggle="dropdown">
                  <span className="sr-only">Toggle Dropdown</span>
                </button>
                <div className="dropdown-menu">
                  <a href="#" className={`dropdown-item ${enableVerifyMemberLink ? "" : "disabled"}`}
                    onClick={this.reservationConfirmMembers} data-dismiss-modal="false">
                    Update and Verify Member(s)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : null;
    //var membersModal = null;

    //is expected to be this.state.flightTransaction
    var cashChangeAmount = (e) => {
      if(e == null){ return toCurrency(0.0); }

      changeAmount = e.transactions.filter((e) => {return e.detail_type == "cash_change"});
      if(changeAmount.length == 0){ return toCurrency(0.0); }

      return toCurrency(parseFloat([...changeAmount].pop().trans_amount));

    };

    //TODO: make the transaction modal as a component
    var cashChangeBody = (this.state.flightTransaction == null) ? null : (
      <div>
        <hr />
        <h2>Transaction Complete</h2>
        <h2>Change: {cashChangeAmount(this.state.flightTransaction)}</h2>
      </div>
    );

    var paymentBody = (this.state.flightTransaction == null || parseFloat(this.state.flightTransaction.outstanding) == 0) ? cashChangeBody : (
      <div>
        <h3>Payment</h3>
        <table className="table">
          <tbody>
            <tr>
              <td>
                <button className="btn btn-secondary" type="button" data-payment-method="cc"
                  onClick={this.reservationConfirm}>Payment with CC</button>
              </td>
              <td>
                <div className="form-group">
                  <div className="input-group">
                    <div className="input-group-addon">RM</div>
                    <input className="form-control" type="number" name="cash_value" value={this.state.cashValue} onChange={this.updateCashValue} />
                  </div>
                </div>
                <button type="button" className="btn btn-secondary" data-cash-value={this.state.cashValue}
                  disabled={this.state.cashValue < parseFloat(this.state.flightTransaction.outstanding) } data-payment-method="cash"
                  onClick={this.reservationConfirm} >
                  Payment With Cash
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );

    var urTransactionModal = this.state.flightTransaction == null ? null : (
      <div className="modal fade" id="ur-transaction-modal">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <button className="close" data-dismiss="modal" type="button"><span>&times;</span></button>
              <h4>Transaction And Payment</h4>
            </div>
            <div className="modal-body">
              <h3>Transactions</h3>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Detail</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  { this.state.flightTransaction.transactions.map( (e,i) => {
                    return (
                      <tr key={i}>
                        <td>{e.created_at}</td>
                        <td>{e.detail_type}</td>
                        <td>{toCurrency(parseFloat(e.trans_amount))}</td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td colSpan="2"><h4>Outstanding</h4></td>
                    <td><h4>{toCurrency(parseFloat(this.state.flightTransaction.outstanding))}</h4></td>
                  </tr>
                </tbody>
              </table>
              { paymentBody }
            </div>
            <div className="modal-footer">
              <button type="button" data-dismiss="modal" className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div className="row">
        {membersModal}
        {urTransactionModal}
        <div className="col-lg-8">
          <p>
            <input className="datepicker form-control" ref="datepicker"
              type="text" defaultValue={this.state.queryDate} style={ {zIndex:100, position:'relative'}}/>
            Updates in {Date(Date.now + this.props.refreshEvery*1000)} ... <a href="#" onClick={this.refreshNow}>Refresh Now</a>
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
            flightTransaction={this.state.flightTransaction}
            days={this.state.days} updatePax={this.updatePax} flightInfo={this.state.flightInfo} options={this.props.options}
            reservationUpdate={this.reservationUpdate} reservationCancel={this.reservationCancel} reservationNew={this.reservationNew}
            reservationConfirm={this.reservationConfirm}
            updateMembersList={this.updateMembersList}
            dashStats={dashStats}
            />
        </div>
      </div>
    )
  }
});
