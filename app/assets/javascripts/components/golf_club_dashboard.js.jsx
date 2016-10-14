
var GolfClubDashboard = React.createClass({
  propTypes: {
      club:React.PropTypes.object,
      paths:React.PropTypes.object
  },
  getInitialState: function(){
    var today = new Date();
    days = arrayFromRange(0,6).map( (e,i) => {
        newDay = new Date();
        newDay.setDate(today.getDate() + e);
        return newDay.getDate() + '/' + (newDay.getMonth() + 1) + '/' + newDay.getFullYear();
    });

    return {
      flightsArray:[],
      days: days
    }
  },
  componentDidMount:function(){
    $(this.refs.datepicker).datepicker();

    //load the schedule, today and the next 6 days
    var handle = this;
    this.state.days.map( (e,i) => {
      $.getJSON(handle.props.paths.club_path, {date:e}, function(data){
        var newFlightsArray = handle.state.flightsArray;
        newFlightsArray[i] = data.flights;
        handle.setState({flightsArray:newFlightsArray});
      });
    });

  },
  render: function(){
    return (
      <div>
        <input ref="datepicker" type="text" />
        { this.state.flightsArray.map( (e,i) => {
          return (
            <div>
              <strong>{this.state.days[i]}</strong>
              <GolfCardTimesGroup flights={e} />
            </div>
          );
        })}
      </div>
    )
  }
});
