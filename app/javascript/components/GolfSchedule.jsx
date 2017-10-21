var PropTypes = require('prop-types');
var React = require('react');
var GolfReserveForm = require('./GolfReserveForm');

var golfCardDefaultOptions = {
    GolfClubTimesShowPrices:true,
    displayCourseGroup:false
};

// a simple component to show the day's schedule given the golf_club_id and also the date
// queryDate must be in DD-MM-YYYY format
// should load the schedule when the dates are in
class GolfSchedule extends React.Component {
  static propTypes = {
    crsfToken: PropTypes.string,
    paths: PropTypes.object,
    queryDate: PropTypes.string,
    queryData: PropTypes.object,
    club: PropTypes.object,
    flights: PropTypes.array,
    options: PropTypes.object
  };

  static defaultProps = {
      paths: { reserve:"/", golfClub:"/"}, options:golfCardDefaultOptions
  };

  state = {
    queryDate: this.props.queryDate,
    queryData: this.props.queryData,
    flights: this.props.flights
  };

  componentDidMount() {
    var handle = this;
    $(this.refs.queryDate).datepicker({ minDate:0,
      onSelect: function(dateText){
          handle.dateChanged(dateText);
          return;
      },
      dateFormat:'dd/mm/yy'
    });
  }

  dateChanged = (e) => {
    //handle when the date changed
    //get updated teeTimes
    var handle = this;

    //should clear out all flights before selecting dates
    this.setState({flights:[]});

    fetch(`/golf_clubs/${this.props.club.id}/flight_listings.json?` + $.param({date:e}), {
      credentials:'same-origin'
    }).then( (response) => {
      return response.json();
    }).then( (json) => {
      handle.setState({flights:json, queryDate:e, queryData:{date:e, session:'AllDay'}});
    });
  };

  render() {
    /*
        <GolfReserveForm crsfToken={this.props.crsfToken} club={this.props.club} teeTimes={this.state.teeTimes} prices={this.props.prices}
          reserveTarget={this.props.path.reserveTarget} flight={this.state.flight}/>
    */
    return (
      <ul className="list-group list-group-flush">
        <li className="list-group-item">
          <form className="w-100">
            <div className="form-group mb-0 w-100">
              <input type="text" className="datepicker form-control border-0" ref="queryDate" name="dateQuery" value={this.state.queryDate}
              style={ {zIndex:1000, position:'relative'}} onChange={this.dateChanged }/>
            </div>
          </form>
        </li>
        <GolfReserveForm {...this.props} {...this.state} timeGroupDisplay='overflow' />
      </ul>
    );
  }
}

/*
        <GolfReserveForm crsfToken={this.props.crsfToken} reserveTarget={this.props.paths.reserve}
          club={this.props.club} flights={this.state.flights} queryData={this.state.queryData}
          insurance_modes={this.props.insurance_modes} options={this.props.options } timeGroupDisplay='overflow'/>
*/
module.exports = GolfSchedule;
