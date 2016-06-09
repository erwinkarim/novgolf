var daysNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

var GeneralBox = React.createClass({
  propTypes:{
    club:React.PropTypes.object
  },
  componentDidMount:function(){
    var map;
    var handle = this;

    //disable this if there's no internet
    var initMap = function(){
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 3.15785, lng: 101.71165 },
          zoom: 16
        });

        $('<div/>').addClass('centerMarker').appendTo(map.getDiv());


        map.addListener('dragend', function(){
          coor = map.getCenter()
          handle.setState({lat:coor.lat(), lng:coor.lng()});
        });
    };
    initMap();

    console.log(this.state);


    $(this.refs.openHour).timepicker({disableTextInput:'true', minTime:"05:00", maxTime:"23:00"});
    $(this.refs.closeHour).timepicker({disableTextInput:'true', minTime:"05:00", maxTime:"23:00"});

  },
  getInitialState: function(){
    //check the state
    newClub = this.props.club;
    newClub.name = (newClub.name == null) ? "" : newClub.name;
    newClub.description = (newClub.description == null) ? "" : newClub.description;
    newClub.address = (newClub.address == null) ? "" : newClub.address;
    newClub.open_hour = (newClub.open_hour == null) ? "07:00am" : newClub.open_hour;
    newClub.close_hour = (newClub.close_hour == null) ? "22:00am" : newClub.close_hour;

    return {
      club:newClub, lat:3.15785, lng:101.71165
    };
  },
  updateGolf: function(e){
    console.log('address bar updated');
    var newClub = this.state.club;
    newClub.address = e.target.value;
    this.setState({ club:newClub});
  },
  render: function(){
    //sanity check, ensure that all required items are filled up

    return (
      <div className="panel">
        <div className="collapse in panel-collapse" id="general">
          <div className="card">
            <div className="card-header">General</div>
            <div className="card-block">
              <div className="form-group">
                <label>Name</label>
                <input type="text" className="form-control" placeholder="Club Name" name="golf_club[name]" defaultValue={this.state.club.name} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" name="description" rows="10" placeholder="A description about the club"
                  name="golf_club[description]" defaultValue={this.state.club.description} ></textarea>
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea className="form-control" name="address" rows="5" placeholder="The club address" name="golf_club[address]"
                  defaultValue={this.state.club.address}></textarea>
              </div>
              <div className="form-group">
                <label>Open Hour</label>
                <input type="text" className="form-control" placeholder="9:00" ref="openHour" name="golf_club[open_hour]" defaultValue={this.state.club.open_hour}/>
              </div>
              <div className="form-group">
                <label>Close Hour</label>
                <input type="text" className="form-control" placeholder="22:00" ref="closeHour" name="golf_club[close_hour]" defaultValue={this.state.club.close_hour}/>
              </div>
              <div className="form-group">
                <div className="googlemaps" id="map" refs="map" style={ {height:'25vh'}} >Google Maps Here</div>
              </div>
              <div className="form-group">
                <label>Lat</label>
                <input type="text" className="form-control" placeholder="Lat" name="golf_club[lat]" value={this.state.lat} disabled="disabled"/>
              </div>
              <div className="form-group">
                <label>Long</label>
                <input type="text" className="form-control" placeholder="Long" name="golf_club[lng]" value={this.state.lng } disabled="disabled"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var FlightScheduleControl = React.createClass({
  propTypes: {
      flightTimes: React.PropTypes.array
  },
  getDefaultProps: function(){
      return {
        flightTimes: ["07:00am", "07:07am", "07:14am"]
      }
  },
  render: function(){
    return (
      <div>
        <div className="card">
          <div className="card-block btn-toolbar">{ this.props.flightTimes.map( (e,i) =>
            <div className="btn-group" key={i}>
              <div className="btn btn-secondary">{e}</div>
              <div className="btn btn-secondary" value={i}><i className="fa fa-close" value={i}></i></div>
            </div>
          ) }</div>
        </div>
        <div className="input-group">
          <input typeName="text" className="form-control" ref="textInput" />
          <span className="input-group-addon">
            <i className="fa fa-plus"></i>
          </span>
        </div>
      </div>

    );
  }
});

var FlightSchedulePriceCard = React.createClass({
  propTypes: {
    flightSchedule:React.PropTypes.object,
    scheduleIndex:React.PropTypes.number
  },
  componentDidMount: function(){
    console.log("scheduleIndex = " + this.props.scheduleIndex);
  },
  render: function(){
    return (
      <div className="card">
        <div className="card-header">
          Flight Schedule / Pricing
          <div className="pull-right">
            <button className="close" type="button" onClick={this.props.handleClose} value={this.props.scheduleIndex}>
              <span value={this.props.scheduleIndex}>&times;</span>
            </button>
          </div>
        </div>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            <h4>Price:</h4>
            <div className="form-group">
              <label>Flight Price</label>
              <div className="input-group">
                <span  className="input-group-addon">MYR</span>
                <input className="form-control" type="number" name="price[flight]" />
                <span  className="input-group-addon">.00</span>
              </div>
            </div>
            <div className="form-group">
              <label>Buggy Price</label>
              <div className="input-group">
                <span  className="input-group-addon">MYR</span>
                <input className="form-control" type="number" name="price[buggy]" />
                <span  className="input-group-addon">.00</span>
              </div>
            </div>
            <div className="form-group">
              <label>Caddy Price</label>
              <div className="input-group">
                <span  className="input-group-addon">MYR</span>
                <input className="form-control" type="number" name="price[caddy]" />
                <span  className="input-group-addon">.00</span>
              </div>
            </div>
            <div className="form-group">
              <label>Insurance Price</label>
              <div className="input-group">
                <span  className="input-group-addon">MYR</span>
                <input className="form-control" type="number" name="price[insurance]" />
                <span  className="input-group-addon">.00</span>
              </div>
            </div>
          </li>
          <li className="list-group-item">
            <h4>Settings:</h4>
            <div className="form-group">
              <label>Minimum balls per flight:</label>
              <select className="form-control">{ [2,3,4].map ( (e,i) =>
                  <option key={i}>{e}</option>
              )}</select>
            </div>
            <div className="form-group">
              <label>Maximum balls per flight:</label>
              <select className="form-control">{ [4,5,6].map ( (e,i) =>
                  <option key={i}>{e}</option>
              )}</select>
            </div>
          </li>
          <li className="list-group-item">
            <h4>Days Active</h4>
            <div className="btn-group" data-toggle="buttons">{
              daysNames.map( (e,i) =>
              <label className="btn btn-secondary" key={i+1}>
                <input type="checkbox" autocomplete="off" value={i+1} />{ e }
              </label>
            )}</div>
          </li>
          <li className="list-group-item">
            <h4>Times Active</h4>
            <FlightScheduleControl />
          </li>
        </ul>
      </div>
    );
  }
});

var FlightBox = React.createClass({
  propTypes: {
    flightSchedules:React.PropTypes.array,
    flightDummy:React.PropTypes.object
  },
  getInitialState: function(){
      return {
          flightSchedules:this.props.flightSchedules
      };
  },
  componentDidMount: function(){
  },
  handleClick: function(e){
    console.log('suppose to add new price/flight panel here');
    newFlightSchedules = this.state.flightSchedules;
    newFlightSchedules.push(this.props.flightDummy);
    this.setState({ filghtSchedules:newFlightSchedules});
  },
  handleClose: function(e){
    console.log("handle when flight times button close is pressed");
    console.log(e.target.value);
  },
  render: function(){
    return (
      <div className="panel">
        <div className="collapse panel-collapse" id="flight">
          <div className="card">
            <div className="card-header">Flight Schedules and Pricing</div>
            <div className="card-block">
              { this.state.flightSchedules.map( (e,i) =>
                  <FlightSchedulePriceCard key={i} flightSchedule={e} handleClose={this.handleClose} scheduleIndex={i} />
              )}
              <button type="button" onClick={this.handleClick} className="btn btn-primary">
                <i className="fa fa-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var AmmenitiesBox = React.createClass({
  render: function(){
    return (
      <div className="panel">
        <div className="collapse panel-collapse" id="ammenities">
          <div className="card">
            <div className="card-header">Ammenities</div>
            <div className="card-block">
              <p className="card-text">Stuff about Ammenities here</p>
            </div>
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
    flightDummy: React.PropTypes.object,
    chargeSchedules: React.PropTypes.array,
    form: React.PropTypes.object
  },
  componentDidMount: function(){
    //console.log(this.props);
  },
  render: function() {
    return (
      <div>
        <div className="col-xs-12 col-md-4">
          <ul className="list-group">
            <li className="list-group-item">
              <a href="#general" data-toggle="collapse" data-parent="#accordion">General</a>
            </li>
            <li className="list-group-item">
              <a href="#flight" data-toggle="collapse" data-parent="#accordion">Flight Schedules and Pricing</a>
            </li>
            <li className="list-group-item">
              <a href="#ammenities" data-toggle="collapse" data-parent="#accordion">Ammenities</a>
            </li>
          </ul>
        </div>
        <div className="col-xs-12 col-md-8">
          <form method="post" action={this.props.form.action_path} >
            <div id="accordion" role="tablist">
              <input type="hidden" name="authenticity_token" value={this.props.form.crsfToken} />
              <GeneralBox club={this.props.club} />
              <FlightBox flightSchedules={this.props.flightSchedules} flightDummy={this.props.flightDummy} />
              <AmmenitiesBox />
              <button className="btn btn-primary" type="submit">Create!</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
});
