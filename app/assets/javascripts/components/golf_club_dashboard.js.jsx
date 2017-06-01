let FLIGHT_INFO_DEFAULTS = {
      pax:0, member:0, buggy:0, caddy:0, insurance:0, tax:0.00, totalPrice:0.00, members:[], reserved_by:null,
      ur_contact:null, reserve_method:0, reservation_id:null
};
let UR_CONTACT_DEFAULTS = {
  id:"", contact_type:"UrContact", name:"", email:"", telephone:""
};

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
      <div className="card">
        <diuv className="card-header">
          <h3>Stats</h3>
        </diuv>
        <div className="card-block">
          <p>Duration: {this.props.days[0]} to {this.props.days[6]}</p>
          <p>Courses: {this.state.coursesBooked}/{this.state.coursesTotal} </p>
          <div className="progress" value={this.state.coursesBooked} max={this.state.coursesTotal}>
            <span className="progress-bar" style={{width:`${this.state.coursesBooked/this.state.coursesTotal*100}%`}}></span>
          </div>
          <p>Revenue: {toCurrency(parseFloat(this.state.revenue))}</p>
        </div>
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
  toggleChevron: function(){
    $(this.refs.chevron).toggleClass('fa-angle-double-up');
    $(this.refs.chevron).toggleClass('fa-angle-double-down');
  },
  render:function(){
    //load the flight info if booked, default is null
    var flightInfo = null;
    var btnRow = null;
    var moneyInfo = null;
    var courseInfo = null;
    var toggleReservationPanel = this.props.status == null ? null : (
      <a onClick={this.toggleChevron} data-toggle="collapse" href="#reservationCollapse"><i ref="chevron" className="fa fa-angle-double-up"></i></a>
    );
    var disableFnBtn = true;

    var outstandingText = this.props.flightTransaction == null ? "Outstanding" : (
      parseFloat(this.props.flightTransaction.outstanding) == 0 ? "Cash Change" : "Outstanding"
    );

    var outstandingModalLink = this.props.flightTransaction == null ? <span>Outstanding</span> : (
      <a href="#ur-transaction-modal" data-toggle="modal">{outstandingText}</a>
    );

    if(this.props.loadFlight){
      disableFnBtn = false;
      var flight = this.props.flightsArray[this.props.selectedArray][this.props.selectedFlight];
      var outstanding_value = this.props.flightTransaction == null ? toCurrency(0.0) :
      (
        parseFloat(this.props.flightTransaction.outstanding) == 0 ?
        toCurrency(parseFloat(this.props.flightTransaction.change)) :
        toCurrency(parseFloat(this.props.flightTransaction.outstanding))
      );

      // show which button is available based on select course status
      if(this.props.selectedCourse == null){
        btnRow = null;
      } else {
        //evaluate the state of the selected course
        var course_state = this.props.flightsArray[this.props.selectedArray][this.props.selectedFlight].course_data.courses[this.props.selectedCourse];
        if(course_state.first_reservation_id == null){
          btnRow = (
            <li className="list-group-item">
              <button className="btn btn-secondary ml-2 mb-2" type="button" disabled={disableFnBtn} onClick={this.props.reservationNew}>Reserve</button>
            </li>
          );
        } else {
          btnRow = (
            <li className="list-group-item">
              <button className="btn btn-secondary ml-2 mb-2" type="button" disabled={disableFnBtn} onClick={this.props.reservationUpdate}>Update</button>
              <button className="btn btn-danger ml-2 mb-2" type="button" disabled={disableFnBtn} onClick={this.props.reservationCancel}>Cancel</button>
            </li>
          );
        }
      }

      courseInfo = (
        <li className="list-group-item">
          <GolfCoursesGroup
            flight={flight} selectCourse={this.props.selectCourse} selectedCourse={this.props.selectedCourse}
            reservation={this.props.flightInfo}/>
        </li>
      )

      courseInfo = (
        <li className="list-group-item">
          <GolfCoursesGroup
            flight={flight} selectCourse={this.props.selectCourse} selectedCourse={this.props.selectedCourse}
            reservation={this.props.flightInfo}/>
        </li>
      )

      flightInfo = (
        <ReserveFormPage flight={flight} flightInfo={ this.props.flightInfo } isActive={true} updatePrice={this.props.updatePax }
          selectCourse={this.props.selectCourse} options={this.props.options} selectedCourse={this.props.selectedCourse}
          updateMembersList={this.props.updateMembersList} displayAs="flushed-list" courseSelectionAdminMode={true} />
      )

      moneyInfo = (
        <li className="list-group-item">
          <h4>Tax: {toCurrency(parseFloat(this.props.flightInfo.tax))}</h4>
          <h3>Total: {toCurrency(parseFloat(this.props.flightInfo.totalPrice))} </h3>
          <h4>{outstandingModalLink}: {outstanding_value}</h4>
        </li>
      );
    };

    return(
      <div className="card mb-2" ref={ (dashStatus) => {this.dashStatus=dashStatus;}} style={ {background:'papayawhip'} }>
        <div className="card-header">
            <h3 className="w-100">Flight <small>{toggleReservationPanel}</small></h3>
        </div>
        <div className="collapse show" id="reservationCollapse">
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              Selected Flight: {this.props.status}
            </li>
            { courseInfo}
            { flightInfo }
            { moneyInfo }
            { btnRow }
          </ul>
        </div>
      </div>
    );
  }
});

var ReservationTransactionModal = React.createClass({
  propTypes:{
      flightTransaction:React.PropTypes.object,
      cashValue:React.PropTypes.number,
      reservationPay:React.PropTypes.func,
      updateCashValue:React.PropTypes.func
  },
  render: function(){
    var cashChangeAmount = (e) => {
      if(e == null){ return toCurrency(0.0); }

      changeAmount = e.transactions.filter((e) => {return e.detail_type == "cash_change"});
      if(changeAmount.length == 0){ return toCurrency(0.0); }

      return toCurrency(parseFloat([...changeAmount].pop().trans_amount));
    };

    var cashChangeBody = (this.props.flightTransaction == null) ? null : (
      <div>
        <hr />
        <h2>Transaction Complete</h2>
        <h2>Change: {cashChangeAmount(this.props.flightTransaction)}</h2>
      </div>
    );

    var paymentBody = (this.props.flightTransaction == null || parseFloat(this.props.flightTransaction.outstanding) == 0) ? cashChangeBody : (
      <div>
        <h3>Payment</h3>
        <table className="table">
          <tbody>
            <tr>
              <td>
                <button className="btn btn-secondary" type="button" data-payment-method="cc"
                  disabled={this.props.processing}
                  onClick={this.props.reservationPay}>Payment with CC</button>
              </td>
              <td>
                <div className="form-group">
                  <div className="input-group">
                    <div className="input-group-addon">RM</div>
                    <input className="form-control" type="number" name="cash_value" value={this.props.cashValue} onChange={this.props.updateCashValue} />
                  </div>
                </div>
                <button type="button" className="btn btn-secondary" data-cash-value={this.props.cashValue}
                  disabled={this.props.cashValue < parseFloat(this.props.flightTransaction.outstanding) || this.props.processing }
                  data-payment-method="cash"
                  onClick={this.props.reservationPay} >
                  Payment With Cash
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );

    var loadingBody = (this.props.processing) ? (
      <tr><td colSpan="3">Loading... </td></tr>
    ) : null;

    var urTransactionModal = this.props.flightTransaction == null ? null : (
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
                  { this.props.flightTransaction.transactions.map( (e,i) => {
                    return (
                      <tr key={i}>
                        <td>{e.created_at}</td>
                        <td>{e.detail_type}</td>
                        <td>{toCurrency(parseFloat(e.trans_amount))}</td>
                      </tr>
                    );
                  })}
                  { loadingBody }
                  <tr>
                    <td colSpan="2"><h4>Outstanding</h4></td>
                    <td><h4>{toCurrency(parseFloat(this.props.flightTransaction.outstanding))}</h4></td>
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

    return (urTransactionModal);
  }
});

var ReservationMembersModal = React.createClass({
  propTypes:{
      updateMembersList:React.PropTypes.func,
      updatePax:React.PropTypes.func,
      reservationConfirmMembers:React.PropTypes.func,
      flightInfo:React.PropTypes.object,
      flightsArray:React.PropTypes.array,
      selectedArray:React.PropTypes.number,
      selectedFlight:React.PropTypes.number,
      selectedCourse:React.PropTypes.number
  },
  render: function(){
    //handle initial cases when selectedArray is not loaded yet
    var modalMinMember = 0;
    var modalMaxMember = 5;
    if(this.props.selectedArray != null){
        modalMinMember = this.props.flightsArray[this.props.selectedArray][this.props.selectedFlight].minPax;
        modalMaxMember = this.props.flightsArray[this.props.selectedArray][this.props.selectedFlight].maxPax;
    };

    //should only enable if there's a reservation ID
    var enableVerifyMemberLink = this.props.selectedArray == null ? false : (
      this.props.flightsArray[this.props.selectedArray][this.props.selectedFlight]
      .course_data.courses[this.props.selectedCourse].reservation_status == 8
    );

    var membersModal = this.props.selectedArray != null ? (
      <div id="membersModal" ref="membersModal" className="modal fade" data-backdrop="static" data-keyboard="false">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" onClick={this.props.updateMembersList}>&times;</button>
              <h4 className="modal-title">Members List</h4>
            </div>
            <div className="modal-body">
              <form action="/" className="container-fluid" ref="memberBody">
                { this.props.flightInfo.members.map( (e,i) => {
                  var random_id = randomID();
                  return (
                    <div key={i} ref="memberInfo" className="form-group row">
                      <input type="hidden"  name={`members[${random_id}][id]`} defaultValue={this.props.flightInfo.members[i].id} />
                      <div className="col-sm-5">
                        <input type="text" className="form-control" name={`members[${random_id}][name]`}
                          defaultValue={this.props.flightInfo.members[i].name } placeholder="Member Name"/>
                      </div>
                      <div className="col-sm-5">
                        <input type="text" className="form-control" name={`members[${random_id}][member_id]`}
                          defaultValue={this.props.flightInfo.members[i].member_id} placeholder="Member ID"/>
                      </div>
                      <div className="col-sm-2">
                        <button className="btn btn-danger" onClick={this.props.updatePax}
                          value={this.props.flightInfo.member - 1} data-index={this.props.flightInfo.index} data-target="member"
                          disabled={this.props.flightInfo.member + this.props.flightInfo.pax == modalMinMember}
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
                    <button className="btn btn-primary" onClick={this.props.updatePax}
                      type="button"
                      value={this.props.flightInfo.member + 1} data-index={this.props.flightInfo.index} data-target="member"
                      disabled={this.props.flightInfo.member ==
                        this.props.selectedArray ==  modalMaxMember }
                    >
                      <i className="fa fa-plus"></i>
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={this.props.reservationConfirmMembers}>
                Update & Verify Members
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null;

    return (membersModal);
  }
});

var ReservationContactInfoModal = React.createClass({
  propTypes:{
    reservation:React.PropTypes.object,
    paths:React.PropTypes.object,
    token:React.PropTypes.string
  },
  getInitialState: function(){
    return {ur_contact:this.props.reservation.ur_contact}
  },
  componentWillReceiveProps:function(nextProps){
    var newContact = this.props.reservation.ur_contact == null ?
      UR_CONTACT_DEFAULTS : this.props.reservation.ur_contact;
    this.setState({ur_contact:newContact});
  },
  handleChangeContact: function(e){
    //update the ur_contact state
    var newUrContact = (this.state.ur_contact===null) ?
      Object.assign({}, UR_CONTACT_DEFAULTS) : this.state.ur_contact;

    //reset id to null
    newUrContact.id = "";
    newUrContact = Object.assign(newUrContact, {[e.target.dataset.target]:e.target.value});
    this.setState({ur_contact:newUrContact});
  },
  componentDidMount:function(){
    var handle = this;

    $(this.contactModal).on('hide.bs.modal', function(){
      //reset the state.ur_contact
      var newUrContact = (handle.props.reservation.ur_contact === null) ?
        Object.assign({}, UR_CONTACT_DEFAULTS) : handle.props.reservation.ur_contact;
      handle.setState({ur_contact:newUrContact});
    });

    var autocompleteOptions = {
      serviceUrl:'/admin/contacts/suggest',
      dataType:'json',
      deferRequestBy:100,
      paramName:'q',
      minChars:3,
      formatResult:function(suggestion,currentValue){
        return `${suggestion.data.name} (e:${suggestion.data.email} / t:${suggestion.data.telephone})`.replace(currentValue, `<strong>${currentValue}</strong>`);
      },
      onSelect:function(suggestion){
        //update the ur_contact state
        var newUrContact = Object.assign(UR_CONTACT_DEFAULTS,
          {id:suggestion.data.id, name:suggestion.data.name, email:suggestion.data.email, telephone:suggestion.data.telephone}
        );

        handle.setState({ur_contact:newUrContact});
      }
    };

    $(this.contactNameInput).autocomplete(autocompleteOptions);
    $(this.contactEmailInput).autocomplete(autocompleteOptions);
  },
  sendContactUpdate:function(e){
    var handle = this;
    //update the contact details
    var form_path = `${this.props.paths.user_reservations}/${this.props.reservation.reservation_id}/ur_contacts`;

    fetch(form_path, {
      method:'POST',
      body:new FormData(handle.contactForm),
      credentials: 'same-origin'
    }).then(function(response){
      //all done, should update the user_reservation
      if(response.status >= 200 && response.status < 400){
        $.snackbar({content:'Contact Info Updated', style:'notice'});
        //reload the current reservation
        handle.props.reservationReload();
      } else {
        $.snackbar({content:'There are some errors updating the contact info', style:'error'});
        $.snackbar({content:response.text(), style:'error'});
        throw new Error(response.statusText);
      };
    });

    //update the reservation
    $(this.contactModal).modal('hide');
  },
  render: function(){
    disableForm = this.props.reservation.reserve_method == "online";
    var contact_id = (this.state.ur_contact === null) ? "" :
      this.state.ur_contact.id;
    var contact_type = (this.state.ur_contact === null) ? "" :
      this.state.ur_contact.contact_type;
    var contact_name = (this.state.ur_contact === null) ? "" :
      this.state.ur_contact.name;
    var contact_email = (this.state.ur_contact === null) ? "" :
      this.state.ur_contact.email;
    var contact_telephone = (this.state.ur_contact === null) ? "" :
      this.state.ur_contact.telephone;

    var online_notice = disableForm ? (
      <p>The reservation was creating using JomGolf website</p>
    ) : null;

    return (
      <div id="flight-contact-info-modal" className="modal fade" ref={(input)=>{this.contactModal = input;}}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Reservation Contact Info</h3>
              <button type="button" className="close" data-dismiss="modal">
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body">
              {online_notice}
              <form action={`${this.props.paths.user_reservations}/${this.props.reservation.reservation_id}/ur_contacts`}
                method="POST" ref={(form)=>this.contactForm=form}>
                <input type="hidden" value={this.props.token} name="authenticity_token" />
                <input type="hidden" name="ur_contact[id]" value={contact_id} />
                <input type="hidden" name="ur_contact[type]" value={contact_type} />
                <div className="row form-group">
                  <label className="col-4 col-form-label">Name:</label>
                  <div className="col-8">
                    <input type="text" className="form-control" name="ur_contact[name]"
                      data-target="name" value={contact_name} onChange={this.handleChangeContact}
                      ref={(input)=>{this.contactNameInput=input;}}
                      placeholder="Name" disabled={disableForm}/>
                  </div>
                </div>
                <div className="row form-group">
                  <label className="col-4 col-form-label">Email:</label>
                  <div className="col-8">
                    <input type="text" className="form-control" name="ur_contact[email]"
                      data-target="email" value={contact_email} onChange={this.handleChangeContact}
                      ref={(input)=>{this.contactEmailInput=input;}}
                      placeholder="Email" disabled={disableForm} />
                  </div>
                </div>
                <div className="row form-group">
                  <label className="col-4 col-form-label">Telephone:</label>
                  <div className="col-8">
                    <input type="text" className="form-control" name="ur_contact[telephone]"
                      data-target="telephone" value={contact_telephone} onChange={this.handleChangeContact}
                      placeholder="Telephone" disabled={disableForm} />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button data-dismiss="modal" type="button" className="btn btn-secondary">Close</button>
              <button type="button" className="btn btn-primary" onClick={this.sendContactUpdate} disabled={disableForm}
                data-value="" data-array-index="">
                Update Contacts
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

});

//should which courses are occupied
//should show statuses
var GolfCoursesGroup = React.createClass({
  propTypes:{
    flight: React.PropTypes.object,
    selectedCourse: React.PropTypes.number,
    reservation:React.PropTypes.object
  },
  getDefaultProps: function(){
    return {selectedCourse:0};
  },
  getInitialState: function(){
    return {random_id:randomID()};
  },
  notifyContact: function(){
    var handle = this;

    //check if there's a reservation
    if(this.props.reservation.reservation_id === null){
      $.snackbar({content:'No reservation detected', style:'error'});
      return;
    }

    //check if contact  is there
    if(this.props.reservation.ur_contact === null){
      $.snackbar({content:'No contact info detected', style:'error'});
      return;
    }

    //check if contact has email
    if(this.props.reservation.ur_contact.email === null || this.props.reservation.ur_contact.email == ''){
      $.snackbar({content:'Contact has no email', style:'error'});
      return;
    }

    //request server to send notification
    fetch(`/admin/user_reservations/${this.props.reservation.reservation_id}/notify`, {
      method:'GET',
      credentials:'same-origin'
    }).then(function(response){
      if(response.status >= 400){
        $.snackbar({content:'Error when trying to send email', style:'error'});
        return;
      }

      //everything ok
      $.snackbar({content:'Email notification sent', style:'notice'});
    })
  },
  componentDidUpdate:function(prevProps, prevState){
    //close the collapse if the selectedCourse changes
    if(this.props.selectedCourse != prevProps.selectedCourse){
      $(this.reservationDetailCollapse).collapse('hide');
    }

  },
  render: function(){
    var reservation_id = this.props.flight.course_data.courses[this.props.selectedCourse].reservation_id || null;
    var reservation_user_id = this.props.reservation.reserved_by == null ? null :
      this.props.reservation.reserved_by.id;
    var reservation_text = this.props.flight.course_data.courses[this.props.selectedCourse].reservation_status_text || "Nil";
    var reservation_link = reservation_id == null ? "Nil" : (
      <a href={`#reservation-detail`} data-toggle="collapse">{reservation_id}</a>
    );
    var reservation_detail_link = reservation_id == null ? null : (
      <a href={`/users/${reservation_user_id}/reservations/${reservation_id}`} className="btn btn-info mb-2 mr-2" target="_blank">View</a>
    );
    var reservation_notify_link = reservation_id == null ? null : (
      <button type="button" className="btn btn-info mb-2 mr-2" onClick={this.notifyContact}>Send Notification</button>
    )

    var ur_contact_name = this.props.reservation.ur_contact == null ? "No Info" :
      this.props.reservation.ur_contact.name;
    var ur_contact_email = this.props.reservation.ur_contact == null ? "No Info" :
      this.props.reservation.ur_contact.email;
    var ur_contact_telephone = this.props.reservation.ur_contact == null ? "No Info" :
      this.props.reservation.ur_contact.telephone;

    var reserved_by_text = this.props.reservation.reserved_by == null ? "Nil" : this.props.reservation.reserved_by.name;
    return (
      <div>
        <p>Courses:</p>
        <div className="btn-group w-100 flex-wrap" data-toggle="buttons">{ this.props.flight.course_data.courses.map( (e,i) => {
          var reserve_status = "secondary"
          switch (e.reservation_status) {
            case 1: reserve_status = "warning"; break;
            case 8: reserve_status = "info"; break;
            case 2: reserve_status = "danger"; break;
            case 3: reserve_status = "danger"; break;
            default: reserve_status = "secondary";
          };
          var activeState = (i == this.props.selectedCourse) ? "active" : null;
          return (
            <label className={`btn btn-${reserve_status} ${activeState}`} key={i} onClick={this.props.selectCourse}
              data-index={i} data-course-id={e.id} data-reservation-id={e.reservation_id}
              data-target="first_course_id" data-value={e.id}>

              <input type="radio" name="courses" value={`course-${e.id}`}  />
              {e.name}
            </label>
          );
        })}</div>
        <ul className="list-unstyled">
          <li> Selected Course: {this.props.flight.course_data.courses[this.props.selectedCourse].name}; </li>
          <li> Reservation ID:{reservation_link}; </li>
          <li> Reservation Status: {reservation_text } </li>
        </ul>
        <div className="collapse in" id={`reservation-detail`} ref={(collapse)=>{this.reservationDetailCollapse = collapse;}}>
          <hr />
          <ul className="list-unstyled">
            <li>Reserved By: {reserved_by_text} </li>
            <li>Reserved For:
              <ul>
                <li>Name: {ur_contact_name}</li>
                <li>Email: {ur_contact_email} </li>
                <li>Telephone: {ur_contact_telephone} </li>
              </ul>
            </li>
          </ul>
          <hr />
          {reservation_detail_link}
          {reservation_notify_link}
          <button type="button" className="btn btn-info mb-2 mr-2" data-target="#flight-contact-info-modal" data-toggle="modal">Edit Contact</button>
          <button type="button" className="btn btn-secondary mb-2 mr-2" data-toggle="collapse" data-target="#reservation-detail">Close</button>
        </div>
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
      return { options: {displayCourseGroup:false, GolfClubTimesShowPrices:false, displayMembersModal:true}, refreshEvery:60};
  },
  getInitialState: function(){
    var today = new Date();
    var queryDate = today.getDate() + '/' + (today.getMonth()+1) + '/' + today.getFullYear();

    return {
      flightsArray:[], dashBoardStatusText:'None Selected',
      days: this.updateDays(today), queryDate:queryDate,
      loadFlight: false, selectedArray:null, selectedFlight:null, selectedCourse:null,
      flightInfo:FLIGHT_INFO_DEFAULTS,
      flightTransaction:null,
      cashValue:0.0, processing:false
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
      return newDay.getFullYear() + '-' + pad(newDay.getMonth() + 1) + '-' + pad(newDay.getDate());
      //return newDay.getDate() + '/' + (newDay.getMonth() + 1) + '/' + newDay.getFullYear();
    });
    return days;
  },
  loadSchedule: function(){

    var handle = this;
    var newFlightsArray = this.state.flightsArray;
    $.snackbar({content:'Loading Schedule...'});

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
      $.snackbar({content:'Schedule loaded'});

      //auto load transactions if course selected
      if(handle.state.selectedCourse == null){
        //console.log('handle.selectedCourse was null');
        return 0;
      };

      var reservation_id = handle.state.flightsArray[handle.state.selectedArray][handle.state.selectedFlight].course_data.courses[handle.state.selectedCourse].reservation_id;
      if(reservation_id == null){
        //console.log('reservation_id was null');
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
      fetch(`${handle.props.paths.user_reservations}/${reservation_id}`, {
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json'}
      }).then(function(response){
        return response.json();
      }).then(function(data){
        var reserve = data.user_reservation;
        var newFlightInfo = Object.assign(currentFlightInfo,
          {
            pax:reserve.count_pax, member:reserve.count_member, buggy:reserve.count_buggy, caddy:reserve.count_caddy,
            insurance:reserve.count_insurance, tax:reserve.actual_tax, totalPrice:reserve.total_price, members:reserve.ur_member_details,
            reserved_by:reserve.reserved_by, ur_contact: reserve.ur_contact, reserve_method:reserve.reserve_method, reservation_id:reserve.id,
            first_course_id:reserve.course_listing_id, second_course_id:reserve.second_course_listing_id

          });
        handle.setState({flightInfo:newFlightInfo});
      });

      //get transactions info
      fetch(`${handle.props.paths.user_reservations}/${reservation_id}/ur_transactions`, {
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json'}
      }).then(function(response){
        return response.json();
      }).then(function(data){
        handle.setState({flightTransaction:data});
      });
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
    //include value targets when it's talking about reservation
    if(e.target.dataset.target=="first_course_id" || e.target.dataset.target=="second_course_id"){
      Object.assign(e.target, {value:e.target.dataset.value});
    };
    var newFlightInfo = this.state.flightInfo;
    var flight = this.state.flightsArray[this.state.selectedArray][this.state.selectedFlight];

    newFlightInfo = flightFunctions.updateCount(e, newFlightInfo, flight);
    newFlightInfo = this.updatePrice(newFlightInfo, flight);

    /*
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
      /*
      var newFlightInfo = {pax:flight.minPax, member:0, buggy:flight.minCart, caddy:flight.minCaddy, insurance:0,
        tax:0.00, totalPrice:0.00, members:[]};
        */
      var newFlightInfo = Object.assign({}, FLIGHT_INFO_DEFAULTS);
      var firstCourseId = parseInt(e.target.dataset.courseId);
      var courseData = flight.course_data.courses.find( (e) => {return e.id == firstCourseId});
      //choose the first available course if current selection has no reservation_id
      //otherwise choose the assocaited second course id
      var secondCourseId = (courseData.reservation_id == null) ?
        (flight.course_data.courses.find( (e) => {return e.second_reservation_id == null;} ).id ) :
        (flight.course_data.courses.find( (e) => {return e.second_reservation_id == courseData.first_reservation_id}).id );
      newFlightInfo = Object.assign(newFlightInfo, {first_course_id:firstCourseId, second_course_id:secondCourseId});
      newFlightInfo = this.updatePrice(newFlightInfo, flight);
      this.updatePax(e);
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

    var clickDashPromise = new Promise(function(resolve,reject){
      //first, update the info when selecting a time

      //parseInt for IE
      var selectedArray = parseInt(e.target.dataset.arrayIndex);
      var selectedIndex = parseInt(e.target.dataset.value);

      //if array changed, reset active class on the previous array
      if(selectedArray != handle.state.selectedArray){
        $($('.btn-group')[handle.state.selectedArray]).find('.active').toggleClass('active');
      };

      //hide the reservation detail
      $('#reservation-detail').collapse('hide');

      //setup the dashboard status
      var newDashText = handle.state.days[selectedArray] + ", " + handle.state.flightsArray[selectedArray][selectedIndex].tee_time;
      var flight = handle.state.flightsArray[selectedArray][selectedIndex];
      //var newFlightInfo = {pax:flight.minPax, member:0, buggy:flight.minCart, caddy:flight.minCaddy, insurance:0, members:[], tax:0.00, totalPrice:0.00};
      //var newDefaults = Object.assign({}, FLIGHT_INFO_DEFAULTS);
      var newFlightInfo = Object.assign(FLIGHT_INFO_DEFAULTS, {
        pax:flight.minPax, buggy:flight.minCart, caddy:flight.minCaddy,
        first_course_id:flight.course_data.courses[0].id, second_course_id:flight.course_data.courses[0].id
      });
      //console.log("newFlightInfo", newFlightInfo);

      newFlightInfo = handle.updatePrice(newFlightInfo, flight);

      //setup the state
      handle.setState({
        dashBoardStatusText:newDashText,
        selectedArray:parseInt(e.target.dataset.arrayIndex),
        selectedFlight: parseInt(e.target.dataset.value), selectedCourse:0, loadFlight:true,
        flightInfo:newFlightInfo
      });

      resolve({flight:flight, newFlightInfo:newFlightInfo});
    });

    clickDashPromise.then(function(data){
      //load the user_reservation_id for the first course
      //var user_reservation_id = Math.min.apply(null, flight.course_data.courses.map((e,i) => e.reservation_id) );
      var user_reservation_id = data.flight.course_data.courses[0].reservation_id;
      if(user_reservation_id){
        var newFlightInfo = data.newFlightInfo;
        handle.loadReservationJSON(user_reservation_id, newFlightInfo);
      } else {
        handle.setState({flightTransaction:null, flightInfo:data.newFlightInfo});
      };
    });



  },
  updateMembersList: function(e){
    var membersArray = $(this.refs.membersModal.refs.memberBody).serializeArray();

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
      $(this.refs.membersModal.refs.membersModal).modal('hide');
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
          //console.log("error", error);
          $.snackbar({content:"Unable to Update Reservation"});
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
        //console.log("cancel reservation ", course.reservation_id);
        fetch(`${this.props.paths.user_reservations}/${course.reservation_id}`,{
          method:'DELETE',
          credentials:'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body:JSON.stringify({ authenticity_token:this.props.token})
        }).then(function(response){
          return response.json();
        }).then(function(json){
          $.snackbar({content:json.message});
          //set the flight transaction to null to kill the outstanding modal link
          handle.setState({flightTransaction:null});
          handle.loadSchedule();
        });
      };
    };


  },
  reservationNew: function(e){
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
      //update the current flightInfo to include reservation id
      var newFlightInfo = handle.state.flightInfo;
      newFlightInfo.reservation_id = data.reservation.id;
      handle.setState({flightInfo:newFlightInfo});

      handle.loadSchedule();
    }).catch(function(ex){
      $.snackbar({content:'Failed to reserve Flight', style:'error'});
      //console.log("exception", ex);
    });
  },
  reservationPay: function(e){
    var flight = this.state.flightsArray[this.state.selectedArray][this.state.selectedFlight];
    var handle = this;
    if("courses" in flight.course_data){
      var course = flight.course_data.courses[this.state.selectedCourse];
      if(course.reservation_id){
        //console.log("make payment for reservation", course.reservation_id);
        handle.setState({processing:true});
        $.snackbar({content:'Attempting to pay ...'});

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
          handle.setState({processing:false});
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
      //console.log('send msg to confirm members inside promise');
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
        //console.log('member list verified');
        $.snackbar({content:json.message});
        handle.loadSchedule();
      });

    }).catch(
      function(reason){
        $.snackbar({content:'Unable to verify member list', class:'error'});
      }
    );

    $(handle.refs.membersModal.refs.membersModal).modal('hide');

  },
  reservationUpdateContactInfo: function(e){
    //update reservation info
    return null;
  },
  reservationReload:function(){
    if(this.state.flightInfo === null){
      return;
    }

    if(this.state.flightInfo.reservation_id == null){
      console.log("current reservation_id is null");
      return;
    }

    //reload current reservation
    var currentFlightInfo = this.state.flightInfo;
    this.loadReservationJSON(this.state.flightInfo.reservation_id, currentFlightInfo);
  },
  updateCashValue: function(e){
    this.setState({cashValue:parseFloat(e.target.value)});
  },
  refreshNow: function(e){
    e.preventDefault();
    this.loadSchedule();
  },
  componentDidMount:function(){
    $(this.dashStatus).sticky({topSpacing:10});

    var handle = this;

    //setup the datepicker
    $(this.datepicker).datepicker({
      dateFormat:'dd/M/yy',
      onClose:function(dateText, obj){
        var newDate = Date.parse(`${obj.selectedMonth+1}/${obj.selectedDay}/${obj.selectedYear}`);
        handle.dateChanged(newDate);
      }
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
    var dashStats = (<GolfClubDashStatistics flightsArray={this.state.flightsArray} days={this.state.days} token={this.props.token} />);

    return (
      <div className="row">
        <ReservationMembersModal ref="membersModal"
          updateMembersList={this.updateMembersList} updatePax={this.updatePax} reservationConfirmMembers={this.reservationConfirmMembers}
          flightsArray={this.state.flightsArray} flightInfo={this.state.flightInfo}
          selectedArray={this.state.selectedArray} selectedFlight={this.state.selectedFlight} selectedCourse={this.state.selectedCourse}
        />
        <ReservationTransactionModal flightTransaction={this.state.flightTransaction} cashValue={this.state.cashValue}
          reservationPay={this.reservationPay} updateCashValue={this.updateCashValue} processing={this.state.processing}/>
        <ReservationContactInfoModal reservation={this.state.flightInfo} paths={this.props.paths} token={this.props.token}
          reservationReload={this.reservationReload}
          />
        <div className="col-lg-8">
          <p>
            <input className="datepicker form-control" ref={ (datepicker)=>{this.datepicker=datepicker; }}
              id="datepicker"
              type="text" defaultValue={this.state.queryDate} style={ {zIndex:100, position:'relative'}}/>
            Updates in {Date(Date.now + this.props.refreshEvery*1000)} ... <a href="#" onClick={this.refreshNow}>Refresh Now</a>
          </p>
          { this.state.flightsArray.length == 0 ?
            <p><i className="fa fa-cog fa-spin"></i> Loading...</p> :
            this.state.flightsArray.map( (e,i) => {
            return (
              <div key={i} >
                <strong>{this.state.days[i]} ({getDayOfWeek((new Date(this.state.days[i])).getDay())})</strong>
                <GolfCardTimesGroup flights={e} btnGroupMode="radio" handleClick={this.handleClick}
                  arrayIndex={i} adminMode={true} options={this.props.options} />
              </div>
            );
          })}
        </div>
        <div className="col-lg-4">
          <div ref={(dashStatus) => {this.dashStatus = dashStatus;}}>
            <GolfClubDashStatus status={this.state.dashBoardStatusText} loadFlight={this.state.loadFlight}
              flightsArray={this.state.flightsArray}
              selectedArray={this.state.selectedArray} selectedFlight={this.state.selectedFlight} selectedCourse={this.state.selectedCourse}
              selectCourse={this.selectCourse}
              flightTransaction={this.state.flightTransaction}
              days={this.state.days} updatePax={this.updatePax} flightInfo={this.state.flightInfo} options={this.props.options}
              reservationUpdate={this.reservationUpdate} reservationCancel={this.reservationCancel} reservationNew={this.reservationNew}
              updateMembersList={this.updateMembersList}
              />
            {dashStats}
          </div>
        </div>
      </div>
    )
  }
});
