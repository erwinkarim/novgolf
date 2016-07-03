/*
  issues:
    * need to update state when forms are being update. find a better way to manage this
      think about flux
*/
var daysNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/*
to use flux for flight schedule state keeping
*/
var constants = {
    NEW_FLIGHT_SCHEDULE:'NEW_FLIGHT_SCHEDULE',
    DELETE_FLIGHT_SCHEDULE:'DELETE_FLIGHT_SCHEDULE'
};

var flightScheduleStore = Fluxxor.createStore({
    initialize:function(){
        this.flight_schedules = [];
    }
});

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
          center: {lat: parseFloat(handle.props.club.lat), lng: parseFloat(handle.props.club.lng) },
          zoom: 16
        });

        $('<div/>').addClass('centerMarker').appendTo(map.getDiv());


        map.addListener('dragend', function(){
          coor = map.getCenter()
          //handle.setState({lat:coor.lat(), lng:coor.lng()});
          handle.props.updateLocation(coor.lat(), coor.lng());
        });
    };
    initMap();

    $(this.refs.openHour).timepicker({disableTextInput:true, minTime:"05:00", maxTime:"23:00"});
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
    //var openHourObj = new Date(this.props.club.open_hour);
    //var openHourStr = openHourObj.getUTCHours() + ":" + openHourObj.getUTCMinutes();

    //var closeHourObj = new Date(this.props.club.close_hour);
    //var closeHourStr = closeHourObj.getUTCHours() + ":" + closeHourObj.getUTCMinutes();

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
                <input type="text" className="form-control" placeholder="9:00" id="openHour" ref="openHour" name="golf_club[open_hour]" defaultValue={this.props.club.open_hour}/>
              </div>
              <div className="form-group">
                <label>Close Hour</label>
                <input type="text" className="form-control" placeholder="22:00" id="closeHour" ref="closeHour" name="golf_club[close_hour]" defaultValue={this.props.club.close_hour}/>
              </div>
              <div className="form-group">
                <label>Location</label>
                <div className="googlemaps" id="map" refs="map" style={ {height:'25vh'}} ></div>
              </div>
              <div className="form-group">
                <label>Lat</label>
                <input type="text" className="form-control" placeholder="Lat" name="golf_club[lat]" value={this.props.club.lat} readOnly="locked" />
              </div>
              <div className="form-group">
                <label>Long</label>
                <input type="text" className="form-control" placeholder="Long" name="golf_club[lng]" value={this.props.club.lng} readOnly="locked" />
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
        flightTimes: [ "07:00am", "07:07am", "07:14am" ]
      }
  },
  getInitialState: function(){
      return { flightTimes:this.props.flightTimes}
  },
  componentDidMount: function(){
    $(this.refs.teeTimeInput).timepicker({minTime:"05:00", maxTime:"23:00"});
  },
  addTeeTime: function(e){
    console.log('add tee time as ', this.refs.teeTimeInput.value);
    var newFt = this.state.flightTimes;
    if(this.refs.teeTimeInput.value != ""){
      //push and reorder
      newFt.push(this.refs.teeTimeInput.value);
      newFt = newFt.sort();

      this.setState({flightTimes:newFt});
    };
  },
  deleteTeeTime: function(e){
    console.log('delete tee time from', e.target.value);
    var newFt = this.state.flightTimes;
    newFt.splice(e.target.value,1);
    this.setState({flightTimes:newFt})
  },
  render: function(){
    return (
      <div>
        <div className="card">
          <div className="card-block btn-toolbar">{ this.state.flightTimes.map( (e,i) =>
            <div className="btn-group" key={i}>
              <input type="hidden" name={"flight[" + this.props.random_id + "][times][]"} value={e} />
              <div className="btn btn-secondary">{e}</div>
              <div className="btn btn-secondary" onClick={this.deleteTeeTime} value={i}><i className="fa fa-close" value={i}></i></div>
            </div>
          ) }</div>
        </div>
        <div className="form-group">
          <input typeName="text" className="form-control" ref="teeTimeInput" />
          <button className="btn btn-secondary" type="button" onClick={this.addTeeTime}><i className="fa fa-plus"></i></button>
        </div>
      </div>

    );
  }
});

var FlightSchedulePriceCard = React.createClass({
  propTypes: {
    flightSchedule:React.PropTypes.object,
    teeTimes:React.PropTypes.array,
    scheduleIndex:React.PropTypes.number
  },
  componentDidMount: function(){
    //console.log("scheduleIndex = " + this.props.scheduleIndex);
    console.log("random_id ", this.state.random_id)
  },
  getInitialState: function(){
    return {
      random_id:(Math.floor(Math.random()*16777215).toString(16)),
      teeTimes: this.props.teeTimes.map((e,i) => e.tee_time)
    }
  },
  getDefaultProps: function(){
    return {
      random_id:(Math.floor(Math.random()*16777215).toString(16))
    }
  },
  handleChange: function(e){

  },
  handleCollapse: function(e){

    console.log('hide invoked');
  },
  insuranceModeChanged: function(e){

    if(e.target.value == 2){
      //insurance is inclusive: zero the rate and disable the field
      console.log('insurance is inclusive');
      $(this.refs.insurance_field).val(0);
      $(this.refs.insurance_field).prop('disabled', true);
    } else {
      $(this.refs.insurance_field).prop('disabled', false);
    }
  },
  render: function(){
    return (
      <div className="card">
        <input type="hidden" name={"flight[" + this.state.random_id + "][flight_id]"} value={this.props.flightSchedule.id} />
        <input type="hidden" name={"flight[" + this.state.random_id + "][charge_id]"} value={this.props.flightSchedule.charge_schedule.id} />
        <div className="card-header">
          <a href={`#collapse-${this.state.random_id}`} data-toggle="collapse">
            <i className="fa fa-chevron-up"></i></a> {this.props.flightSchedule.name} Flight Schedule / Pricing
          <div className="pull-right">
            <button className="close" type="button" onClick={this.props.handleClose} value={this.props.scheduleIndex}>
              <span value={this.props.scheduleIndex}>&times;</span>
            </button>
          </div>
        </div>
        <ul className="list-group list-group-flush collapse in" id={`collapse-${this.state.random_id}`}>
          <li className="list-group-item">
            <h4>Name: </h4>
            <div className="form-group">
              <label>Schedule Name</label>
              <input className="form-control" name={`flight[${this.state.random_id}][name]`} defaultValue={this.props.flightSchedule.name} />
            </div>
          </li>
          <li className="list-group-item">
            <h4>Price:</h4>
            <div className="form-group">
              <label>Green / Player Fee</label>
              <div className="input-group">
                <span  className="input-group-addon">MYR</span>
                <input className="form-control" type="number" name={"flight[" + this.state.random_id + "][session_price]"}
                  defaultValue={parseInt(this.props.flightSchedule.charge_schedule.session_price)} onChange={this.props.updateFlightInfo}/>
                <span  className="input-group-addon">.00</span>
              </div>
            </div>
            <div className="form-group">
              <label>Buggy Fee</label>
              <div className="input-group">
                <span  className="input-group-addon">MYR</span>
                <input className="form-control" type="number" name={"flight["+ this.state.random_id + "][buggy]"}
                  defaultValue={parseInt(this.props.flightSchedule.charge_schedule.cart)} />
                <span  className="input-group-addon">.00</span>
              </div>
            </div>
            <div className="form-group">
              <label>Caddy Fee</label>
              <div className="input-group">
                <span  className="input-group-addon">MYR</span>
                <input className="form-control" type="number" name={"flight[" + this.state.random_id + "][caddy]"}
                  defaultValue={parseInt(this.props.flightSchedule.charge_schedule.caddy)}/>
                <span  className="input-group-addon">.00</span>
              </div>
            </div>
            <div className="form-group">
              <label>Insurance Fee</label>
              <div className="input-group">
                <span  className="input-group-addon">MYR</span>
                <input className="form-control" type="number" name={"flight["+ this.state.random_id + "][insurance]"}
                  ref="insurance_field"
                  defaultValue={parseInt(this.props.flightSchedule.charge_schedule.insurance)}/>
                <span  className="input-group-addon">.00</span>
              </div>
            </div>
            <div className="form-group">
              <label>Insurance Mode</label>
              <select className="form-control" defaultValue={this.props.flightSchedule.charge_schedule.insurance_mode }
                onChange={this.insuranceModeChanged}
                name={`flight[${this.state.random_id}][insurance_mode]`}>{ this.props.insurance_modes.map( (e,i) =>
                <option key={i} value={i} >{e}</option>
              )}</select>
              <br />
              <p>Explaination:-</p>
              <ul>
                <li>Insurance Optional - User can select how many balls will be insured</li>
                <li>Insurance Mandatory - Number of balls determined number of insurance will be taken</li>
                <li>Insurance Inclusive - Insurance Fees will be zeroized and users can't choose how many balls to be insured. It assumed that
                  the green / player fee includes insurance
                </li>
              </ul>
            </div>
          </li>
          <li className="list-group-item">
            <h4>Settings:</h4>
            <div className="form-group">
              <label>Minimum balls per flight:</label>
              <select className="form-control" defaultValue={this.props.flightSchedule.min_pax}
                name={"flight[" + this.state.random_id + "][min_pax]"}>{ [2,3,4].map ( (e,i) =>
                  <option key={i} value={e}>{e}</option>
              )}</select>
            </div>
            <div className="form-group">
              <label>Maximum balls per flight:</label>
              <select className="form-control" defaultValue={this.props.flightSchedule.max_pax}
                name={ "flight[" + this.state.random_id + "][max_pax]"}>{ [4,5,6].map ( (e,i) =>
                  <option key={i} value={e}>{e}</option>
              )}</select>
            </div>
            <div className="form-group">
              <label>Minimum buggies per flight:</label>
              <select className="form-control" defaultValue={this.props.flightSchedule.min_cart}
                name={ `flight[${this.state.random_id}][min_cart]`}>{ [0,1,2].map ( (e,i) =>
                  <option key={i} value={e}>{e}</option>
              )}</select>
            </div>
            <div className="form-group">
              <label>Maximum buggies per flight:</label>
              <select className="form-control" defaultValue={this.props.flightSchedule.max_cart}
                name={ `flight[${this.state.random_id}][max_cart]`}>{ [2,3,4].map ( (e,i) =>
                  <option key={i} value={e}>{e}</option>
              )}</select>
            </div>
            <div className="form-group">
              <label>Minimum caddies per flight:</label>
              <select className="form-control" defaultValue={this.props.flightSchedule.min_caddy}
                name={ `flight[${this.state.random_id}][min_caddy]`}>{ [0,1,2].map ( (e,i) =>
                  <option key={i} value={e}>{e}</option>
              )}</select>
            </div>
            <div className="form-group">
              <label>Maximum caddies per flight:</label>
              <select className="form-control" defaultValue={this.props.flightSchedule.max_caddy}
                name={ `flight[${this.state.random_id}][max_caddy]`}>{ [2,3,4].map ( (e,i) =>
                  <option key={i} value={e}>{e}</option>
              )}</select>
            </div>
          </li>
          <li className="list-group-item">
            <h4>Notes</h4>
            <div className="form-group">
              <label>Notes</label>
              <textarea className="form-control" rows="10"
                defaultValue={ this.props.flightSchedule.charge_schedule.note }
                placeholder="Put your notes about the price schedule here (free F&B voucher during this period). Limit 2048 characters"
                name={`flight[${this.state.random_id}][note]`}></textarea>
            </div>
          </li>
          <li className="list-group-item">
            <h4>Days Active</h4>
            <div className="btn-group" data-toggle="buttons">{
              daysNames.slice(1).map( (e,i) =>
              {
                var isActive = (this.props.flightSchedule.flight_matrices[0]["day" + (i + 1)] == 1) ? "active" : ""
                var isChecked = (this.props.flightSchedule.flight_matrices[0]["day" + (i + 1)] == 1) ? true : false
                return (<label className={"btn btn-secondary " + isActive} key={i+1}>
                  <input type="checkbox" autocomplete="off"
                    name={ "flight[" + this.state.random_id + "][days][]"} value={i+1} checked={isChecked} onChange={this.handleChange} />{ e }
                </label>)
              }
            )}</div>
          </li>
          <li className="list-group-item">
            <h4>Flight Times</h4>
              <FlightScheduleControl flightTimes={this.state.teeTimes} random_id={this.state.random_id} />
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
      console.log(this.props);
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
  updateFlightInfo: function(e, i){
    //should update state info
    console.log("index = " + i);

  },
  render: function(){
    return (
      <div className="panel">
        <div className="collapse panel-collapse" id="flight">
          <div className="card">
            <div className="card-header">Flight Schedules and Pricing</div>
            <div className="card-block">
              Warning: remove flight schedules with caution
            </div>
            <div className="card-block">
              { this.state.flightSchedules.map( (e,i) =>
                  <FlightSchedulePriceCard key={i}
                    flightSchedule={e}
                    teeTimes={e.flight_matrices}
                    handleClose={this.handleClose} scheduleIndex={i}
                    updateFlightInfo={this.updateFlightInfo}
                    deleteTeeTime={this.props.deleteTeeTime} newTeeTime={this.props.newTeeTime} insurance_modes={this.props.insurance_modes} />
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

var AmenitiesCheckBox = React.createClass({
  propTypes: { amenity: React.PropTypes.object },
  render: function(){
    return (
        <div className="col-xs-12 col-md-4">
          <div className="checkbox">
            <label>
              <input type="checkbox" name={ "amenities[" + this.props.amenity.amenity_id + "]"} defaultChecked={this.props.amenity.available} /> { this.props.amenity.label }
            </label>
          </div>
        </div>
    );
  }
});

var AmenitiesBox = React.createClass({
  render: function(){
    return (
      <div className="panel">
        <div className="collapse panel-collapse" id="amenities">
          <div className="card">
            <div className="card-header">Amenities</div>
            <div className="card-block">
              <div className="container">
                <div className="row card-text">{ this.props.amenities.map( (e,i) =>
                    <AmenitiesCheckBox key={i} amenity={e} />
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
    form: React.PropTypes.object,
    insurance_modes: React.PropTypes.array
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
  updateLocation: function(newLat,newLng){
    var newClub = this.state.club;
    newClub.lat = newLat;
    newClub.lng = newLng;
    this.setState({club:newClub});
  },
  submitForm: function(){
    /*
      TODO: give out notifications on error, redirect on success
    */
    $.ajax(this.props.form.action_path, {
        data:$('#golf_form').serialize(),
        method:this.props.form.method,
        dataType:'json'
    }).done(function(data,textStatus, jqXHR){
        console.log('updated without errors');
        //location = data.path.admin;

    }).fail(function(jqXHR, textStatus, errorThrown){
      console.log('error:', jqXHR );
      $('#flash_msgs').append('Errors detected;')
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
              <a href="#amenities" data-toggle="collapse" data-parent="#accordion">Amenities</a>
            </li>
          </ul>
        </div>
        <div className="col-xs-12 col-md-8">
          <form method={this.props.form.method} action={this.props.form.action_path} refs="golf_form" id="golf_form" >
            <div id="accordion" role="tablist">
              <input type="hidden" name="authenticity_token" value={this.props.form.crsfToken} />
              <GeneralBox club={this.state.club} contentChanged={this.contentChanged} updateLocation={this.updateLocation} />
              <FlightBox flightSchedules={this.props.flightSchedules} flightDummy={this.props.flightDummy}
               deleteTeeTime={this.deleteTeeTime} newTeeTime={this.newTeeTime} insurance_modes={this.props.insurance_modes} />
              <AmenitiesBox amenities={this.props.amenities}/>
              <button className="btn btn-primary" type="button" disabled={this.state.disabledSubmit} onClick={this.submitForm}>{button_label}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
});
