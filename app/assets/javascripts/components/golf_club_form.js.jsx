var GeneralBox = React.createClass({
  render: function(){
    return (
      <div className="collapse in" id="general">
        <div className="card">
          <div className="card-header">General</div>
          <div className="card-block">
            <p className="card-text">Stuff about general info here</p>
          </div>
        </div>
      </div>
    );
  }
});

var FlightBox = React.createClass({
  render: function(){
    return (
      <div className="collapse" id="flight">
        <div className="card">
          <div className="card-header">Flight Schedules and Pricing</div>
          <div className="card-block">
            <p className="card-text">Stuff about flight scheduling and pricing here</p>
          </div>
        </div>
      </div>
    );
  }
});

var AmmenitiesBox = React.createClass({
  render: function(){
    return (
      <div className="collapse" id="ammenities">
        <div className="card">
          <div className="card-header">Ammenities</div>
          <div className="card-block">
            <p className="card-text">Stuff about Ammenities here</p>
          </div>
        </div>
      </div>
    );
  }
});

var GolfClubForm = React.createClass({
  propTypes: {
    club: React.PropTypes.object,
    flightSchedules: React.PropTypes.array,
    chargeSchedules: React.PropTypes.array
  },

  render: function() {
    return (
      <div>
        <div className="col-xs-12 col-md-4">
          <ul className="list-group">
            <li className="list-group-item">
              <a href="#general" data-toggle="collapse">General</a>
            </li>
            <li className="list-group-item">
              <a href="#flight" data-toggle="collapse">Flight Schedules and Pricing</a>
            </li>
            <li className="list-group-item">
              <a href="#ammenities" data-toggle="collapse">Ammenities</a>
            </li>
          </ul>
        </div>
        <div className="col-xs-12 col-md-8">
          <GeneralBox />
          <FlightBox />
          <AmmenitiesBox />
        </div>
      </div>
    );
  }
});
