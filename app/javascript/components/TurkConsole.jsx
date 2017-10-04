var React = require("react");
var PropTypes = require("prop-types");
var moment = require('moment');

class TurkSidebar extends React.Component {
  render() {
    return (<div className="col-3">
      <ul className="list-group" ref={(list) => { this.theList = list;}}>
        <li className="list-group-item">{`Unassigned (X)`}</li>
        <li className="list-group-item">{`Pending (X)`}</li>
        <li className="list-group-item">{`All (X)`}</li>
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
    return (
      <div className="card mb-2">
        <div className="card-body">
          <h2 className="card-title"><a href={`#collapse-${this.state.random_id}`} data-toggle="collapse">{this.props.reservation.token}</a></h2>
          <p className="card-text">{ `
            ${this.props.reservation.booking_date}
            ${moment(this.props.reservation.booking_time).format('h:mm:ss a')} @ ${this.props.reservation.golf_club.name}
          `}</p>
          <div className="collapse" id={`collapse-${this.state.random_id}`}><p>More details about clubs here</p></div>
        </div>
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
            <TurkCard key={index} reservation={rev} />
          )
        })
      }</div>
    );

    return (
      <div className="col-9">{reservation_list}</div>
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
    fetch('/operator/load.json', {
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
  render() {
    return (
      <div className="row">
        <TurkSidebar />
        <TurkMainConsole reservations={this.state.reservations} />
      </div>
    );
  }
};

module.exports = TurkConsole;
