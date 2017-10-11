var React = require("react");
var PropTypes = require("prop-types");
var moment = require('moment');

class TurkSidebar extends React.Component {
  render() {
    var unassigned_reservations = this.props.reservations.filter((e) => {return e.status == 'reservation_await_assignment'});
    //need to check that you're the one owning this. Don't need, filtered by the server
    var pending_reservations = this.props.reservations.filter((e) => {return e.status == 'operator_assigned'});
    return (<div className="col-3">
      <ul className="list-group" ref={(list) => { this.theList = list;}}>
        <li className="list-group-item" style={ {backgroundColor:'papayawhip'}}>{`All (${this.props.reservations.length})`}</li>
        <li className="list-group-item">{`Unassigned (${unassigned_reservations.length})`}</li>
        <li className="list-group-item">{`Pending (${pending_reservations.length})`}</li>
        <li className="list-group-item">{`Confirmed`}</li>
        <li className="list-group-item">{`New Time`}</li>
        <li className="list-group-item">{`Canceled`}</li>
      </ul>
    </div>);
  }
  componentDidMount(){
    $(this.theList).sticky({topSpacing:10});
  }
};

class TurkCard extends React.Component {
  constructor(props){
    super(props);
    this.state = { random_id:randomID()};
  }
  render(){
    var status_badge = this.props.reservation.status == 'reservation_await_assignment' ? (
      <span className="badge badge-primary">Unassigned</span>
    ) : (
      <span className="badge badge-danger">Pending Connfirmation</span>
    );

    return (
      <div className="card mb-2">
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            { status_badge}
            <h2 className="card-title"><a href={`#collapse-${this.state.random_id}`} data-toggle="collapse">{this.props.reservation.token}</a></h2>
          </li>
          <li className="list-group-item">
            <p className="card-text">{ `
              ${this.props.reservation.booking_date}
              ${moment.utc(this.props.reservation.booking_time).format('h:mm:ss a Z')} @ ${this.props.reservation.golf_club.name}
            `}</p>
          </li>
          <li className="list-group-item">
            <p className="card-text">
              Club contact: {`${this.props.reservation.golf_club.telephone == null ? 'No telephone' : this.props.reservation.golf_club.telephone}`} /
              {` ${this.props.reservation.golf_club.email == null ? 'No email' : this.props.reservation.golf_club.email}`}
            </p>
          </li>
          <div className="collapse" id={`collapse-${this.state.random_id}`}>
            <li className="list-group-item">
              <hr />
              <p className="card-text">
                User contact: {`${this.props.reservation.user.telephone == null ? 'No telephone' : this.props.reservation.user.telephone}`} /
                {` ${this.props.reservation.user.email}`}
              </p>
              <p>More details about clubs here, like owner, alternative times, and actions</p>
            </li>
            <li className="list-group-item">
              {
                this.props.reservation.status == 'reservation_await_assignment' ? (
                  <button className="btn btn-primary mr-2" data-reservation-id={this.props.reservation.id}
                    onClick={this.props.reservationAction.assignToMe}>
                      Assign to Me
                  </button>
                ) : (
                  <div>
                    <button className="btn btn-primary mr-2" data-reservation-id={this.props.reservation.id} onClick={this.props.reservationAction.confirm}>Confirm</button>
                    <button className="btn btn-secondary mr-2" data-reservation-id={this.props.reservation.id} onClick={this.props.reservationProposeNewTime}>Propose New Time</button>
                    <button className="btn btn-danger mr-2" data-reservation-id={this.props.reservation.id} onClick={this.props.reservationCancel}>Cancel</button>
                  </div>
                )
              }
            </li>
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
    //TODO: load the reservations
    fetch('/operator/user_reservations.json', {
      credentials:'same-origin'
    }).then((response) => {
      return response.json();
    }).then( (json) => {
      handle.setState({ reservations:json.reservations});
    });

    //TODO: subscribe to chanel so can track change
  }
  constructor(props){
    super(props);
    this.state = {
      reservations:[]
    };
  }
  reservationAction = {
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
      //update the reservation object
    }
    cancel:(e) => {
      var handle = this;
      var reservationId = e.target.dataset.reservationId;

      console.log(`cancel reservation ${reservationId}`);
    }
  }
  render() {
    return (
      <div className="row">
        <TurkSidebar {...this.state} />
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
