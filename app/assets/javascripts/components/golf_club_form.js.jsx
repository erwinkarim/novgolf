/*
  issues:
    * need to update state when forms are being update. find a better way to manage this
      think about flux
*/
var daysNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

var GeneralBox = React.createClass({
  propTypes:{
    club:React.PropTypes.object
  },
  componentDidMount:function(){
    var map;
    var handle = this;

    //disable this if there's no internet
    /*
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
    */

    console.log(this.state);


    $("#openHour").timepicker({disableTextInput:true, minTime:"05:00", maxTime:"23:00"});
    $(this.refs.closeHour).timepicker({disableTextInput:true, minTime:"05:00", maxTime:"23:00"});

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
    var openHourObj = new Date(this.props.club.open_hour);
    var openHourStr = openHourObj.getUTCHours() + ":" + openHourObj.getUTCMinutes();

    var closeHourObj = new Date(this.props.club.close_hour);
    var closeHourStr = closeHourObj.getUTCHours() + ":" + closeHourObj.getUTCMinutes();

    return (
      <div className="panel">
        <div className="collapse in panel-collapse" id="general">
          <div className="card">
            <div className="card-header">General</div>
            <div className="card-block">
              <div className="form-group">
                <label>Name</label>
                <input type="text" className="form-control" placeholder="Club Name" name="golf_club[name]"
                  defaultValue={this.props.club.name} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" name="description" rows="10" placeholder="A description about the club"
                  name="golf_club[description]" defaultValue={this.props.club.description} ></textarea>
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea className="form-control" name="address" rows="5" placeholder="The club address" name="golf_club[address]"
                  defaultValue={this.state.club.address}></textarea>
              </div>
              <div className="form-group">
                <label>Open Hour</label>
                <input type="text" className="form-control" placeholder="9:00" id="openHour" ref="openHour" name="golf_club[open_hour]" defaultValue={openHourStr}/>
              </div>
              <div className="form-group">
                <label>Close Hour</label>
                <input type="text" className="form-control" placeholder="22:00" id="closeHour" ref="closeHour" name="golf_club[close_hour]" defaultValue={closeHourStr}/>
              </div>
              <div className="form-group">
                <label>Location</label>
                <div className="googlemaps" id="map" refs="map" style={ {height:'25vh'}} ></div>
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
        flightTimes: [ "07:00", "07:07", "07:14" ]
      }
  },
  render: function(){
    return (
      <div>
        <div className="card">
          <div className="card-block btn-toolbar">{ this.props.flightTimes.map( (e,i) =>
            <div className="btn-group" key={i}>
              <input type="hidden" name={"flight[" + this.props.random_id + "][times][]"} value={e} />
              <div className="btn btn-secondary">{e}</div>
              <div className="btn btn-secondary"><i className="fa fa-close" value={i}></i></div>
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
    //console.log("scheduleIndex = " + this.props.scheduleIndex);
  },
  getInitialState: function(){
    return { random_id:(Math.floor(Math.random()*16777215).toString(16)) }
  },
  getDefaultProps: function(){
    return {
      random_id:(Math.floor(Math.random()*16777215).toString(16))
    }
  },
  render: function(){
    return (
      <div className="card">
        <input type="hidden" name={"flight[" + this.state.random_id + "][flight_id]"} value={this.props.flightSchedule.id} />
        <input type="hidden" name={"flight[" + this.state.random_id + "][charge_id]"} value={this.props.flightSchedule.charge_schedule.id} />
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
                <input className="form-control" type="number" name={"flight[" + this.state.random_id + "][session_price]"}
                  defaultValue={parseInt(this.props.flightSchedule.charge_schedule.session_price)} />
                <span  className="input-group-addon">.00</span>
              </div>
            </div>
            <div className="form-group">
              <label>Buggy Price</label>
              <div className="input-group">
                <span  className="input-group-addon">MYR</span>
                <input className="form-control" type="number" name={"flight["+ this.state.random_id + "][buggy]"}
                  defaultValue={parseInt(this.props.flightSchedule.charge_schedule.cart)} />
                <span  className="input-group-addon">.00</span>
              </div>
            </div>
            <div className="form-group">
              <label>Caddy Price</label>
              <div className="input-group">
                <span  className="input-group-addon">MYR</span>
                <input className="form-control" type="number" name={"flight[" + this.state.random_id + "][caddy]"}
                  defaultValue={parseInt(this.props.flightSchedule.charge_schedule.caddy)}/>
                <span  className="input-group-addon">.00</span>
              </div>
            </div>
            <div className="form-group">
              <label>Insurance Price</label>
              <div className="input-group">
                <span  className="input-group-addon">MYR</span>
                <input className="form-control" type="number" name={"flight["+ this.state.random_id + "][insurance]"}
                  defaultValue={parseInt(this.props.flightSchedule.charge_schedule.insurance)}/>
                <span  className="input-group-addon">.00</span>
              </div>
            </div>
          </li>
          <li className="list-group-item">
            <h4>Settings:</h4>
            <div className="form-group">
              <label>Minimum balls per flight:</label>
              <select className="form-control" defaultValue={this.props.flightSchedule.min_pax} name={"flight[" + this.state.random_id + "][min_pax]"}>{ [2,3,4].map ( (e,i) =>
                  <option key={i}>{e}</option>
              )}</select>
            </div>
            <div className="form-group">
              <label>Maximum balls per flight:</label>
              <select className="form-control" defaultValue={this.props.flightSchedule.max_pax} name={ "flight[" + this.state.random_id + "][max_pax]"}>{ [4,5,6].map ( (e,i) =>
                  <option key={i}>{e}</option>
              )}</select>
            </div>
          </li>
          <li className="list-group-item">
            <h4>Days Active</h4>
            <div className="btn-group" data-toggle="buttons">{
              daysNames.map( (e,i) =>
              {
                var isActive = (this.props.flightSchedule.flight_matrices[0]["day" + i] != null) ? "active" : ""
                var isChecked = (this.props.flightSchedule.flight_matrices[0]["day" + i] != null) ? true : false
                return (<label className={"btn btn-secondary " + isActive} key={i+1}>
                  <input type="checkbox" autocomplete="off" name={ "flight[" + this.state.random_id + "][days][]"} value={i+1} checked={isChecked} />{ e }
                </label>)
              }
            )}</div>
          </li>
          <li className="list-group-item">
            <h4>Times Active</h4>
            <FlightScheduleControl random_id={this.state.random_id} flightMatrices={this.props.flightSchedule.flight_matrices}/>
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
  newSchedule: function(e){
    newFlightSchedules = this.state.flightSchedules;
    newFlightSchedules.push(this.props.flightDummy);
    this.setState({ flightSchedules:newFlightSchedules});
  },
  handleClose: function(e){
    //console.log("handle when flight times button close is pressed");

    //can't delete the first one
    if(e.target.value == 0){
      return;
    }

    //figure out why this doesn't work
    var arrayIndex = parseInt(e.target.value, 10);
    var newFlightSchedules = this.state.flightSchedules;

    console.log("deleting flight schedule index " + arrayIndex);
    console.log(newFlightSchedules);
    newFlightSchedules.splice(arrayIndex,1);
    this.setState({flightSchedules:newFlightSchedules});
    console.log(newFlightSchedules);

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
              <button type="button" onClick={this.newSchedule} className="btn btn-primary">
                <i className="fa fa-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var AmmenitiesCheckBox = React.createClass({
  propTypes: { ammenity: React.PropTypes.object },
  render: function(){
    return (
        <div className="col-xs-12 col-md-4">
          <div className="checkbox">
            <label>
              <input type="checkbox" name={ "amm[" + this.props.ammenity.name + "]"} /> { this.props.ammenity.label }
            </label>
          </div>
        </div>
    );
  }
});

var AmmenitiesBox = React.createClass({
  propTypes: { ammenities: React.PropTypes.array },
  getDefaultProps: function(){
      return { ammenities:[
          { name:'hut', label:'Hut'},
          { name:'restaurant', label:'Restaurant'},
          { name:'atm', label:'ATM'},
          { name:'shops', label:'Shops'},
          { name: 'changing_room', label: 'Changing Room'},
          { name: 'free_internet', label: 'Free Internet'},
          { name: 'free_wifi', label: 'Free Wifi'},
          { name: 'lounge', label: 'Lounge'}
      ] }
  },
  render: function(){
    return (
      <div className="panel">
        <div className="collapse panel-collapse" id="ammenities">
          <div className="card">
            <div className="card-header">Ammenities</div>
            <div className="card-block">
              <div className="container">
                <div className="row card-text">{ this.props.ammenities.map( (e,i) =>
                    <AmmenitiesCheckBox key={i} ammenity={e} />
                )}</div>
              </div>
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
    form: React.PropTypes.object
  },
  componentDidMount: function(){
    //console.log(this.props);
  },
  getInitialState: function(){
    return { disabledSubmit: false, club:this.props.club }
  },
  contentChanged: function(e){
      //if everything is fill up accordingly, enable the create/edit button
      console.log(e.target.key);
  },
  submitForm: function(){
    $.ajax(this.props.form.action_path, {
        data:$('#golf_form').serialize(),
        method:this.props.form.method,
        dataType:'json'
    }).success(function(data,textStatus, jqXHR){

    });
  },
  render: function() {
    var button_label = (this.props.form.method == 'post') ? 'Create!' : 'Update!';

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
          <form method={this.props.form.method} action={this.props.form.action_path} refs="golf_form" id="golf_form" >
            <div id="accordion" role="tablist">
              <input type="hidden" name="authenticity_token" value={this.props.form.crsfToken} />
              <GeneralBox club={this.state.club} contentChanged={this.contentChanged} />
              <FlightBox flightSchedules={this.props.flightSchedules} flightDummy={this.props.flightDummy} />
              <AmmenitiesBox />
              <button className="btn btn-primary" type="button" disabled={this.state.disabledSubmit} onClick={this.submitForm}>{button_label}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
});
