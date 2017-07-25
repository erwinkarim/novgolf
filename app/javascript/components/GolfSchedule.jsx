var React = require('react');
var GolfReserveForm = require('./GolfReserveForm');

var golfCardDefaultOptions = {
    GolfClubTimesShowPrices:true,
    displayCourseGroup:false
};

// a simple component to show the day's schedule given the golf_club_id and also the date
// queryDate must be in DD-MM-YYYY format
var GolfSchedule = React.createClass({
  propTypes: {
    crsfToken: React.PropTypes.string,
    paths: React.PropTypes.object,
    queryDate: React.PropTypes.string,
    queryData: React.PropTypes.object,
    club: React.PropTypes.object,
    flights: React.PropTypes.array,
    options: React.PropTypes.object
  },
  getDefaultProps: function(){
    return {
        paths: { reserve:"/", golfClub:"/"}, options:golfCardDefaultOptions
    };
  },
  getInitialState: function(){
      return {
        queryDate: this.props.queryDate,
        queryData: this.props.queryData,
        flights: this.props.flights
      }
  },
  componentDidMount: function(){
    var handle = this;
    $(this.refs.queryDate).datepicker({ minDate:0,
      onSelect: function(dateText){
          handle.dateChanged(dateText);
          return;
      },
      dateFormat:'dd/mm/yy'
    });
  },
  dateChanged: function(e){
    //handle when the date changed
    //get updated teeTimes
    var handle = this;

    //should clear out all flights before selecting dates
    this.setState({flights:[]});

    $.getJSON(this.props.paths.golfClub, { date:e },  function(data){
      var newFlights = (data == null) ? [] : data.flights;
      var newQueryData = handle.state.queryData;
      newQueryData.date = e;
      handle.setState({flights:newFlights , queryDate:e, queryData:newQueryData})
    });
  },
  render: function(){
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
        <GolfReserveForm crsfToken={this.props.crsfToken} reserveTarget={this.props.paths.reserve}
          club={this.props.club} flights={this.state.flights} queryData={this.state.queryData}
          insurance_modes={this.props.insurance_modes} options={this.props.options } timeGroupDisplay='overflow'/>
      </ul>
    );
  }
});

module.exports = GolfSchedule;
