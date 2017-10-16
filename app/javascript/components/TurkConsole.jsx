var React = require("react");
var PropTypes = require("prop-types");
var moment = require('moment');

class TurkSidebar extends React.Component {
  render() {
    var categories = ['active', 'unassigned', 'pending', 'confirmed', 'newtime', 'canceled'];
    return (<div className="col-3">
      <ul className="list-group" ref={(list) => { this.theList = list;}}>{
        categories.map( (category,i) => {
          return (
            <li key={i} className={`list-group-item cursor-pointer ${this.props.viewMode==category ? 'active' : ''}`}
              data-category={category} onClick={this.props.reservationAction.showCategory}>
                {toTitleCase(category)}
            </li>
          )
        })
      }</ul>
    </div>);
  }
  componentDidMount(){
    $(this.theList).sticky({topSpacing:10});
  }
};

class TurkNewTimeProposal extends React.Component {
  getTimeProposal = (e) => {
    //query new time proposal everytime the date changes
    var handle = this;
    console.log('should ask jomgolf new time');
    //load the time based on reservation date

    var newDate = moment(e.target.value).format('YYYY-MM-DD');

    fetch(`/golf_clubs/${handle.props.reservation.golf_club_id}/flight_listings?` + $.param({date:newDate}), {

    }).then( (response) => {
      return response.json();
    }).then( (json) => {
      //TODO: should handle when newTimeList is empty
      handle.setState({timeList:json, newTime:json[0].matrix_id});
    });
  }
  updateTimeProposal = (e) => {
    //let's see if this works
    var newTime = e.target.value;
    this.setState({newTime:newTime});
  }
  constructor(props){
    super(props)

    //setup state on the time list
    this.state = ({timeList:[], newTime:''})
  }
  componentDidMount(){
    //when shown for the first time,
    var handle = this;
    $(this.time_list_collapse).on('shown.collapse.bs', () => {
      if(handle.state.timeList.length == 0){
        console.log('should load up the time for the first time');
        handle.getTimeProposal(
          { target:{value: handle.props.reservation.booking_date } }
        )
      }
    });
  }
  render(){
    //TODO: submit button only enable when the new date and time is valid
    return (
      <div id={`new-time-proposal-${this.props.random_id}`} className="collapse" ref={(tl) => {this.time_list_collapse = tl;}}>
        <li className="list-group-item">
          <div className="w-100 mb-2">
            <div className="row">
              <div className="col-4">
                <label>New time: </label>
              </div>
              <div className="col-4">
                <input type="date" className="form-control"
                  defaultValue={this.props.reservation.booking_date} onChange={this.getTimeProposal} ref={(d) => {this.newDate = d;}} />
              </div>
              <div className="col-4">
                <select className="form-control" name="flight_matrix_id" onChange={this.updateTimeProposal} ref={(t) => {this.newTime = t;}}>{ this.state.timeList.map( (e,i) => {
                    return (<option disabled={e.course_data.cl_count==e.course_data.ur_cl_count} key={i} value={e.matrix_id}>{e.tee_time}</option>)
                  })
                }</select>
              </div>
            </div>
          </div>
          <div className="w-100 mb-1">
            <button className="btn btn-info mr-2" data-reservation-id={this.props.reservation.id} onClick={this.props.reservationAction.proposeNewTime}
              data-new-date={typeof this.newDate === "undefined" ? '' : this.newDate.value}
              data-new-time={this.state.newTime}
            >
              Confirm New Time Proposal
            </button>
            <button className="btn btn-danger" data-toggle="collapse" data-target={`#new-time-proposal-${this.props.random_id}`}>Cancel</button>
          </div>
        </li>
      </div>
    )
  }
}

class TurkCard extends React.Component {
  constructor(props){
    super(props);
    var handle = this;
    handle.state = { random_id:randomID(), case_histories:null};

  }
  componentDidMount(){

    var handle = this;
    //when the collapse is shown and case_histories is null, load up the case history
    $(this.history_list).on('show.bs.collapse', () => {
      if(handle.state.case_histories === null){
        console.log('show load case history')
        fetch(`/operator/user_reservations/${handle.props.reservation.id}/ur_turk_cases.json`, {
          credentials:'same-origin'
        }).then( (response) => {
          return response.json();
        }).then( (json) => {
          handle.setState({case_histories:json.ur_turk_case_histories});
        });
      }
    });

  }
  render(){
    var status_badge = this.props.reservation.status == 'reservation_await_assignment' ? (
      <span className="badge badge-primary">Unassigned</span>
    ) : this.props.reservation.status == 'operator_confirmed' || this.props.reservation.status == 'reservation_confirmed' ? (
      <span className="badge badge-success">Confirmed</span>
    ) : this.props.reservation.status == 'operator_canceled' ? (
      <span className="badge badge-danger">Canceled</span>
    ) : this.props.reservation.status == 'operator_new_proposal' ? (
      <span className="badge badge-info">New Time Proposed</span>
    ) : this.props.reservation.status == 'operator_assigned' ? (
      <span className="badge badge-warning">Pending Confirmation</span>
    ) : (
      <span className="badge badge-info">Unknown Status</span>
    );

    //show past due if status is unassigned or assinged but not confirmed and the reservation date is in the base
    var past_due_badge = (
      ['reservation_await_assignment', 'operator_new_proposal', 'operator_assigned'].includes(this.props.reservation.status)
    ) && ( (new Date()).getTime() > Date.parse(this.props.reservation.booking_date)) ? (
      <span className="badge badge-danger">Past Due</span>
    ) : null;

    var contact_info = this.props.reservation.status != 'reservation_await_assignment' ? (
      <li className="list-group-item">
        <p className="card-text">
          Club contact:
          {`${this.props.reservation.golf_club.telephone == null ? 'No telephone' : this.props.reservation.golf_club.telephone}`} /
          {` ${this.props.reservation.golf_club.email == null ? 'No email' : this.props.reservation.golf_club.email}`}
        </p>
      </li>
    ) : null;

    var case_history = this.state.case_histories === null ? (
      <div>None detected</div>
    ) : (
      <table className="table mt-2">
        <tbody>
          {
            this.state.case_histories.map( (e, i) => {
              return (<tr key={i}>
                <td>{moment(e.created_at).format('YYYY-MM-DD h:mm:ss a')}</td>
                <td>{e.action} by {e.user.name}</td>
              </tr>);
            })
          }
        </tbody>
      </table>
    )

    var button_array = this.props.reservation.status == 'reservation_await_assignment' ? (
      <button className="btn btn-primary mr-2"
        data-reservation-id={this.props.reservation.id} data-csrf-token={this.props.csrf_token}
        onClick={this.props.reservationAction.assignToMe}>Assign to Me</button>
    ) : this.props.reservation.status == 'operator_assigned' ? (
      <div>
        <button className="btn btn-primary mr-2" data-reservation-id={this.props.reservation.id} onClick={this.props.reservationAction.confirm}>Confirm</button>
        <button className="btn btn-secondary mr-2" data-toggle="collapse" data-target={`#new-time-proposal-${this.state.random_id}`}>Propose New Time</button>
        <button className="btn btn-danger mr-2" data-reservation-id={this.props.reservation.id} onClick={this.props.reservationAction.cancel}>Cancel</button>
      </div>
    ) : (
      <div>
        <button className="btn btn-primary" data-target={`#collapse-${this.state.random_id}`} data-toggle="collapse">Close</button>
      </div>
    );

    var new_time_proposal = this.props.reservation.status == 'operator_assigned' ? (
      <TurkNewTimeProposal {...this.props} {...this.state} />
    ) : null;

    return (
      <div className="card mb-2">
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            { status_badge} {past_due_badge}
            <h2 className="card-title"><a href={`#collapse-${this.state.random_id}`} data-toggle="collapse">{this.props.reservation.token}</a></h2>
          </li>
          <li className="list-group-item">
            <p className="card-text">{ `
              ${this.props.reservation.booking_date}
              ${moment.utc(this.props.reservation.booking_time).format('h:mm:ss a Z')} @ ${this.props.reservation.golf_club.name}
            `}</p>
          </li>
          { contact_info }
          <div className="collapse" id={`collapse-${this.state.random_id}`}>
            <li className="list-group-item top-border-black">
              <p className="card-text">
                User contact: {`${this.props.reservation.user.telephone == null ? 'No telephone' : this.props.reservation.user.telephone}`} /
                {` ${this.props.reservation.user.email}`}
              </p>
              <p>More details about clubs here, like owner, alternative times, and actions</p>
            </li>
            <li className="list-group-item">
              <div className="w-100">
                <a href={`#case-history-${this.state.random_id}`} data-toggle="collapse">Case History</a>
              </div>
              <div className="w-100 collapse" id={`case-history-${this.state.random_id}`} ref={ (hs) => {this.history_list=hs;} }>
                { case_history}
              </div>
            </li>
            <li className="list-group-item">{ button_array }</li>
            { new_time_proposal }
          </div>
        </ul>
      </div>
    )
  }
};

TurkCard.propTypes = {
  reservation:PropTypes.object
};

class TurkMainConsole extends React.Component {
  render(){
    var reservation_list = this.props.reservations.length == 0 ? (
        <div className="card">
          <div className="card-body">
            <p className="card-text">No reservations yet ...</p>
          </div>
        </div>
    ) : (
      <div >{
        this.props.reservations.map( (rev, index) => {
          return (
            <TurkCard key={index} reservation={rev}
              csrf_token={this.props.csrf_token}
              reservationAction={this.props.reservationAction}
            />
          )
        })
      }</div>
    );

    return (
      <div className="col-9">
        <div className="mb-2">
          <input className="form-control" type="input" placeholder="Search ..."/>
        </div>
        {reservation_list}
      </div>
    );
  }
}

TurkMainConsole.propTypes = {
  reservations:PropTypes.array
};
TurkMainConsole.defaultProps = {
  reservations:[]
}

class TurkConsole extends React.Component {
  componentDidMount(){
    var handle = this;
    console.log('start loading up the user reservations...');

    this.reservationAction.showCategory();


    //TODO: subscribe to chanel so can track change
  }
  constructor(props){
    super(props);
    this.state = {
      reservations:[], viewMode:'active'
    };
  }
  reservationAction = {
    //TODO: streamline the show(cateory to streamline loading all the reservations)
    confirm:(e) => {
      var handle = this;
      var reservationId = e.target.dataset.reservationId;
      console.log(`confirm reservation ${reservationId}`);

      //send command to server to confirm the reservation
      //if confirm, remove from current view
      var formData = new FormData();
      formData.append('authenticity_token', handle.props.csrf_token);

      fetch(`/operator/user_reservations/${reservationId}/confirm`,{
        credentials:'same-origin',
        method:'POST',
        body:formData
      }).then( (response) => {
        //if response if OK, slipce the reservation from current array
        if(response.status >= 200 & response.status < 300){
          //TODO: slide away the card then remove the reservation
          var newReservations = handle.state.reservations;
          newReservations.splice( newReservations.findIndex((ur) => { return ur.id == reservationId}), 1);
          handle.setState({reservations:newReservations});
          $.snackbar({style:'notice', content:`Reservation ${reservationId} is confirmed.`})
        } else {
          //for some reason e.target doesn't work
          $.snackbar({style:'error', content:`Error trying to confirm reservation ${reservationId}`});
        }
      });
    },
    assignToMe:(e) => {
      var handle = this;
      console.log(`self assign reservation ${e.target.dataset.reservationId}`);

      var formData = new FormData();
      formData.append('authenticity_token', handle.props.csrf_token);
      //get assignment on the reservation
      fetch(`/operator/user_reservations/${e.target.dataset.reservationId}/assign_to_me`, {
        credentials:'same-origin',
        method:'POST',
        body:formData
      }).then( (response) => {
        //check if the status is valid, otherwise, update the reservation object

        //if sucessful, send
        return response.json();
      }).then( (json) => {
        //update the reservation with the new status
        var newReservations = handle.state.reservations;
        newReservations[handle.state.reservations.findIndex((e) => {return e.id == json.id})] = json;
        handle.setState({reservations:newReservations});

      });
    },
    cancel:(e) => {
      var handle = this;
      var reservationId = e.target.dataset.reservationId;
      var formData = new FormData();
      formData.append('authenticity_token', handle.props.csrf_token);

      console.log(`cancel reservation ${reservationId}`);
      fetch(`/operator/user_reservations/${reservationId}/cancel`, {
        credentials:'same-origin',
        body:formData,
        method:'POST'
      }).then( (response) => {
        if(response.status >= 200 & response.status < 300){
          //delete the reservation from the active state list
          var newReservations = handle.state.reservations;
          newReservations.splice( newReservations.findIndex((ur) => { return ur.id == reservationId}), 1);
          handle.setState({reservations:newReservations});
          $.snackbar({style:'notice', content:`Reservation ${reservationId} has been cancelled.`})
        } else {
          $.snackbar({style:'error', content:`Problem when canceling reservation ${reservationId}`});
        }

      })
    },
    proposeNewTime:(e) => {
      console.log('tell the server new time has been proposed');
      console.log('e.target.dataset', e.target.dataset);
      var handle = this;
      var reservationId = e.target.dataset.reservationId;

      var formData = new FormData();
      formData.append('authenticity_token', handle.props.csrf_token);
      formData.append('new_date', e.target.dataset.newDate);
      formData.append('new_time', e.target.dataset.newTime);

      fetch(`/operator/user_reservations/${reservationId}/propose_new_time` , {
          credentials:'same-origin',
          method:'POST',
          body:formData
      }).then( (response) => {
        if(response.status >= 200 && response.status < 300){
          return response.json();
        } else {
          $.snackbar({style:'error', content:`Error trying to propose new time for reservation ${reservationId}`})
        }
      }).then( (json) => {
        //update the revelent reservation
        var newReservations = handle.state.reservations;
        newReservations[handle.state.reservations.findIndex((e) => {return e.id == json.id})] = json;
        handle.setState({reservations:newReservations});
        $.snackbar({style:'notice', content:`Reservation ${reservationId} has been updated.`})
      });
    },
    showCategory: (e) => {
      var handle = this;
      var category = 'active';
      if(typeof e !== 'undefined'){
         e.preventDefault();
         category = e.target.dataset.category;
       };

      fetch(`/operator/user_reservations.json?` + $.param({view:category}), {
        credentials:'same-origin'
      }).then((response) => {
        //TODO: handle error(s)
        return response.json();
      }).then( (json) => {
        //propoer reset
        handle.setState({reservations:[], viewMode:category});
        handle.setState({ reservations:json.reservations})
      });

    },
    showSearch:(e)=> {
      //show reservations based on saved results
    }
  }
  render() {
    return (
      <div className="row">
        <TurkSidebar reservationAction={this.reservationAction} {...this.state} />
        <TurkMainConsole
          reservationAction={this.reservationAction}
          {...this.props} {...this.state} />
      </div>
    );
  }
};

TurkConsole.propTypes = {
  reservations:PropTypes.array
}

TurkConsole.defaultProps = {
  reservations:[]
};

module.exports = TurkConsole;
