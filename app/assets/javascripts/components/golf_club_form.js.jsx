var GeneralBox = React.createClass({
  componentDidMount:function(){
    var map;
    var initMap = function(){
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: -34.397, lng: 150.644},
          zoom: 8
        });
    };
    initMap();
  },
  render: function(){
    return (
      <div className="collapse in" id="general">
        <div className="card">
          <div className="card-header">General</div>
          <div className="card-block">
            <div className="form-group">
              <label>Name</label>
              <input type="text" className="form-control" placeholder="Club Name" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-control" name="description" rows="10" placeholder="A description about the club"></textarea>
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea className="form-control" name="address" rows="5" placeholder="The club address"></textarea>
            </div>
            <div className="form-group">
              <div className="googlemaps" id="map" refs="map" style={ {height:'25vh'}} >Google Maps Here</div>
            </div>
            <div className="form-group">
              <label>Lat</label>
              <input type="text" className="form-control" placeholder="Lat" />
            </div>
            <div className="form-group">
              <label>Long</label>
              <input type="text" className="form-control" placeholder="Long" />
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var FlightSchedulePriceCard = React.createClass({
  render: function(){
    return (
      <div className="card">
        <div className="card-header">Flight Schedule / Pricing </div>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">Price Schedule Here</li>
          <li className="list-group-item">Days here</li>
          <li className="list-group-item">Time Schedule here</li>
        </ul>
      </div>
    );
  }
});

var FlightBox = React.createClass({
  propTypes: {
      flightSchedulePriceCards:React.PropTypes.array
  },
  render: function(){
    return (
      <div className="collapse" id="flight">
        <div className="card">
          <div className="card-header">Flight Schedules and Pricing</div>
          <div className="card-block">
            <p className="card-text">Stuff about flight scheduling and pricing here</p>
            <FlightSchedulePriceCard />
            <FlightSchedulePriceCard />
            <a className="btn btn-primary">
              <i className="fa fa-plus"></i>
            </a>
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
    chargeSchedules: React.PropTypes.array,
    form: React.PropTypes.object
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
