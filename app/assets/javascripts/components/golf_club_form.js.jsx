var daysNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
/*
  issues:
    * need to update state when forms are being update. find a better way to manage this
      think about flux
*/

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

        //why it can't reused function?
        map.addListener('dragend', function(){
          var coor = map.getCenter()
          handle.props.updateLocation(coor.lat(), coor.lng());
        });

        map.addListener('zoom_changed', function(){
          var coor = map.getCenter()
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
      <div className="panel mb-2">
        <div className="collapse in panel-collapse" id="general">
          <div className="card mb-2">
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
                <div className="googlemaps" id="map" ref="map" style={ {height:'25vh'}} ></div>
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
          <CourseListingForm
            newCourse={this.props.newCourse} deleteCourse={this.props.deleteCourse} updateCourse={this.props.updateCourse}
            courses={this.props.club.course_listings} dummyData={this.props.dummyData} />
        </div>
      </div>
    );
  }
});

var CourseListingForm = React.createClass({
  render: function(){
    var disableDeleteButton = this.props.courses.length < 2 ? true : false;
    return (
      <div className="card">
        <h3 className="card-header">Course Listings</h3>
        <div className="card-block">
          <table className="table">
            <thead><tr>
              <th>ID</th><th>Name</th><th>Status</th><th>Action</th>
            </tr></thead>
            <tbody>{ this.props.courses.map( (e,i) => {
              var random_id = randomID();
              return (
                <tr key={i}>
                  <td>{e.id}<input type="hidden" name={`courses[${random_id}][id]`} value={e.id || undefined} /></td>
                  <td><input type="text" name={ `courses[${random_id}][name]`} value={e.name} className="form-control"
                    onChange={this.props.updateCourse} data-attribute="name" data-index={i} /></td>
                  <td><select value={e.course_status_id} name={`courses[${random_id}][course_status_id]`} className="form-control"
                    onChange={this.props.updateCourse} data-attribute="course_status_id" data-index={i}>{
                    this.props.dummyData.course_status.map( (e,i) => {
                        return ( <option value={e.id} key={i}>{e.desc}</option> )
                    })
                  }</select></td>
                  <th><button type="button" className="btn btn-danger" onClick={this.props.deleteCourse} disabled={disableDeleteButton} data-index={i}>
                    <i className="fa fa-minus"></i></button>
                  </th>
                </tr>
              )}
            )}</tbody>
          </table>
          <button type="button" className="btn btn-primary" onClick={this.props.newCourse}>
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>
    );
  }
});

var FlightScheduleControl = React.createClass({
  propTypes: {
      flightTimes: React.PropTypes.array
  },
  getInitialState: function(){
      return {flightTime:""}
  },
  componentDidMount: function(){
    $(this.refs.teeTimeInput).timepicker({ minTime:"05:00", maxTime:"23:00", timeFormat:"h:ia"});
    $(this.refs.teeTimeInput).on('changeTime', this.updateFlightTime);
  },
  updateFlightTime: function(e){
    this.setState({flightTime:e.target.value});
  },
  render: function(){
    return (
      <div>
        <div className="card mb-2">
          <div className="card-block btn-toolbar flex-wrap">{ this.props.flightTimes.map( (e,i) =>
            <div className="btn-group mb-2 mr-2" key={i}>
              <input type="hidden" name={"flight[" + this.props.random_id + "][times][]"} value={e} />
              <div className="btn btn-secondary">{e}</div>
              <div className="btn btn-secondary" onClick={this.props.deleteTeeTime} data-index-schedule={this.props.scheduleIndex} data-index-time={i} >
                <i className="fa fa-close" data-index-schedule={this.props.scheduleIndex} data-index-time={i}></i>
              </div>
            </div>
          ) }</div>
        </div>
        <div className="form-group">
          <input type="text" className="form-control mb-2" ref="teeTimeInput" value={this.state.flightTime} onChange={this.updateFlightTime} />
          <button className="btn btn-secondary" type="button" onClick={this.props.addTeeTime}
            data-index-schedule={this.props.scheduleIndex} data-value={this.state.flightTime}>
            <i className="fa fa-plus"></i>
          </button>
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
    $(this.refs.cardContent).on('hide.bs.collapse', this.handleCollapse);
    $(this.refs.cardContent).on('show.bs.collapse', this.handleUncollapse);
    //$(this.refs.cardSummary).hide();
  },
  componentWillReceiveProps: function(nextProps){
    if(nextProps.flightSchedule.charge_schedule.insurance_mode == 2){
        $(this.refs.insurance_field).attr('disabled', true);
    } else {
        $(this.refs.insurance_field).attr('disabled', false);
    }
  },
  getInitialState: function(){
    return {
      random_id:(Math.floor(Math.random()*16777215).toString(16))
    }
  },
  getDefaultProps: function(){
    return {
      random_id:(Math.floor(Math.random()*16777215).toString(16))
    }
  },
  handleCollapse: function(e){
    $(this.refs.cardSummary).slideDown(100);
    $(this.refs.chevronState).removeClass("fa-chevron-up");
    $(this.refs.chevronState).addClass("fa-chevron-down");
  },
  handleUncollapse: function(e){
    $(this.refs.cardSummary).slideUp(100);
    $(this.refs.chevronState).removeClass("fa-chevron-down");
    $(this.refs.chevronState).addClass("fa-chevron-up");
  },
  render: function(){
    return (
      <div className="card mb-2">
        <input type="hidden" name={"flight[" + this.state.random_id + "][flight_id]"} value={this.props.flightSchedule.id} />
        <input type="hidden" name={"flight[" + this.state.random_id + "][charge_id]"} value={this.props.flightSchedule.charge_schedule.id} />
        <div className="card-header">
          <a href={`#collapse-${this.state.random_id}`} data-toggle="collapse">
            <i className="fa fa-chevron-down" ref="chevronState"></i></a> {this.props.flightSchedule.name} Flight Schedule / Pricing
          <div className="pull-right">
            <button className="close" type="button" onClick={this.props.deleteSchedule} data-value={this.props.scheduleIndex}>
              <span data-value={this.props.scheduleIndex}>&times;</span>
            </button>
          </div>
        </div>
        <div className="collapse" id={`collapse-${this.state.random_id}`} ref="cardContent">
          <ul className="list-group list-group-flush collapse">
            <li className="list-group-item">
              <p className="card-text mb-0 w-100">
                <h4>Name: </h4>
                <form>
                  <div className="form-group row">
                    <label className="col-4">Schedule Name</label>
                    <input className="form-control col-8" name={`flight[${this.state.random_id}][name]`}
                      data-index={this.props.scheduleIndex} data-target="name" onChange={this.props.updateFlightInfo} value={this.props.flightSchedule.name} />
                  </div>
                </form>
              </p>
            </li>
            <li className="list-group-item">
              <h4>Price:</h4>
              <div className="w-100 mb-0">
                <div className="form-group row">
                  <label className="col-6">Green / Player Fee</label>
                  <div className="col-6 input-group">
                    <span  className="input-group-addon">MYR</span>
                    <input className="form-control" type="number" name={"flight[" + this.state.random_id + "][session_price]"}
                      data-index={this.props.scheduleIndex} data-target="charge_schedule" data-charge="session_price"
                      onChange={this.props.updateFlightInfo}
                      value={parseInt(this.props.flightSchedule.charge_schedule.session_price)} onChange={this.props.updateFlightInfo}/>
                    <span  className="input-group-addon">.00</span>
                  </div>
                </div>
                <div className="form-group row">
                  <label className="col-6">Buggy Fee</label>
                  <div className="col-6 input-group">
                    <span  className="input-group-addon">MYR</span>
                    <input className="form-control" type="number" name={"flight["+ this.state.random_id + "][buggy]"}
                      data-index={this.props.scheduleIndex} data-target="charge_schedule" data-charge="cart"
                      onChange={this.props.updateFlightInfo}
                      value={parseInt(this.props.flightSchedule.charge_schedule.cart)} />
                    <span  className="input-group-addon">.00</span>
                  </div>
                </div>
                <div className="form-group row">
                  <label className="col-6">Caddy Fee</label>
                  <div className="col-6 input-group">
                    <span  className="input-group-addon">MYR</span>
                    <input className="form-control" type="number" name={"flight[" + this.state.random_id + "][caddy]"}
                      data-index={this.props.scheduleIndex} data-target="charge_schedule" data-charge="caddy"
                      onChange={this.props.updateFlightInfo}
                      value={parseInt(this.props.flightSchedule.charge_schedule.caddy)}/>
                    <span  className="input-group-addon">.00</span>
                  </div>
                </div>
                <div className="form-group row">
                  <label className="col-6">Insurance Fee</label>
                  <div className="col-6 input-group">
                    <span  className="input-group-addon">MYR</span>
                    <input className="form-control" type="number" name={"flight["+ this.state.random_id + "][insurance]"}
                      data-index={this.props.scheduleIndex} data-target="charge_schedule" data-charge="insurance"
                      onChange={this.props.updateFlightInfo}
                      ref="insurance_field"
                      disabled={ this.props.flightSchedule.charge_schedule.insurance_mode == 2 ? true : false }
                      value={parseInt(this.props.flightSchedule.charge_schedule.insurance)}/>
                    <span  className="input-group-addon">.00</span>
                  </div>
                </div>
                <div className="form-group row">
                  <label className="col-6">Insurance Mode</label>
                  <select className="col-6 form-control"
                    value={this.props.flightSchedule.charge_schedule.insurance_mode } onChange={this.props.updateFlightInfo}
                    data-index={this.props.scheduleIndex} data-target="charge_schedule" data-charge="insurance_mode"
                    name={`flight[${this.state.random_id}][insurance_mode]`}>{ this.props.insurance_modes.map( (e,i) =>
                      <option key={i} value={i} >{e}</option>
                  )}</select>
                  <div className="col-12">
                    <p>Explaination:-</p>
                    <ul>
                      <li>Insurance Optional - User can select how many balls will be insured</li>
                      <li>Insurance Mandatory - Number of balls determined number of insurance will be taken</li>
                      <li>Insurance Inclusive - Insurance Fees will be zeroized and users can't choose how many balls to be insured. It assumed that
                        the green / player fee includes insurance
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </li>
            <li className="list-group-item">
              <div className="w-100 mb-0">
                <h4>Settings:</h4>
                <div className="form-group row">
                  <label className="col-8">Minimum balls per flight:</label>
                  <select className="col-4 form-control" value={this.props.flightSchedule.min_pax}
                    data-index={this.props.scheduleIndex} data-target="min_pax"
                    onChange={this.props.updateFlightInfo}
                    name={"flight[" + this.state.random_id + "][min_pax]"}>{ [2,3,4].map ( (e,i) =>
                      <option key={i} value={e}>{e}</option>
                  )}</select>
                </div>
                <div className="form-group row">
                  <label className="col-8">Maximum balls per flight:</label>
                  <select className="col-4 form-control" value={this.props.flightSchedule.max_pax}
                    data-index={this.props.scheduleIndex} data-target="max_pax"
                    onChange={this.props.updateFlightInfo}
                    name={ "flight[" + this.state.random_id + "][max_pax]"}>{ [4,5,6].map ( (e,i) =>
                      <option key={i} value={e}>{e}</option>
                  )}</select>
                </div>
                <div className="form-group row">
                  <label className="col-8">Minimum buggies per flight:</label>
                  <select className="col-4 form-control" value={this.props.flightSchedule.min_cart}
                    data-index={this.props.scheduleIndex} data-target="min_cart"
                    onChange={this.props.updateFlightInfo}
                    name={ `flight[${this.state.random_id}][min_cart]`}>{ [0,1,2].map ( (e,i) =>
                      <option key={i} value={e}>{e}</option>
                  )}</select>
                </div>
                <div className="form-group row">
                  <label className="col-8">Maximum buggies per flight:</label>
                  <select className="col-4 form-control" defaultValue={this.props.flightSchedule.max_cart}
                    data-index={this.props.scheduleIndex} data-target="max_cart"
                    onChange={this.props.updateFlightInfo}
                    name={ `flight[${this.state.random_id}][max_cart]`}>{ [2,3,4].map ( (e,i) =>
                      <option key={i} value={e}>{e}</option>
                  )}</select>
                </div>
                <div className="form-group row">
                  <label className="col-8">Minimum caddies per flight:</label>
                  <select className="col-4 form-control" defaultValue={this.props.flightSchedule.min_caddy}
                    data-index={this.props.scheduleIndex} data-target="min_caddy"
                    onChange={this.props.updateFlightInfo}
                    name={ `flight[${this.state.random_id}][min_caddy]`}>{ [0,1,2].map ( (e,i) =>
                      <option key={i} value={e}>{e}</option>
                  )}</select>
                </div>
                <div className="form-group row">
                  <label className="col-8">Maximum caddies per flight:</label>
                  <select className="col-4 form-control" defaultValue={this.props.flightSchedule.max_caddy}
                    data-index={this.props.scheduleIndex} data-target="max_caddy"
                    onChange={this.props.updateFlightInfo}
                    name={ `flight[${this.state.random_id}][max_caddy]`}>{ [2,3,4].map ( (e,i) =>
                      <option key={i} value={e}>{e}</option>
                  )}</select>
                </div>
              </div>
            </li>
            <li className="list-group-item">
              <div className="mb-0 w-100">
                <h4>Notes</h4>
                <div className="form-group">
                  <textarea className="form-control" rows="10"
                    defaultValue={ this.props.flightSchedule.charge_schedule.note }
                    placeholder="Put your notes about the price schedule here (free F&B voucher during this period). Limit 2048 characters"
                    name={`flight[${this.state.random_id}][note]`}></textarea>
                  <div><a href="https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet" target="_blank">Markdown</a> supported.</div>
                </div>
              </div>
            </li>
            <li className="list-group-item">
              <div className="mb-0 w-100">
                <h4>Days Active</h4>
                <div className="btn-group flex-wrap" data-toggle="buttons">{
                  daysNames.slice(1).map( (e,i) =>
                  {
                    var isActive = (this.props.flightSchedule.flight_matrices[0]["day" + (i + 1)] == 1) ? "active" : ""
                    var isChecked = (this.props.flightSchedule.flight_matrices[0]["day" + (i + 1)] == 1) ? true : false
                    return (
                      <label className={"btn btn-secondary " + isActive} key={i+1}
                        data-index={this.props.scheduleIndex} data-target="flight_matrices" data-flight={i+1}
                        onClick={this.props.updateFlightInfo} value={i+1} >
                        <input key={i+1} type="checkbox" autoComplete="off"
                          name={ "flight[" + this.state.random_id + "][days][]"} defaultValue={i+1} defaultChecked={isChecked} />{ e }
                      </label>
                    )
                  }
                )}</div>
              </div>
            </li>
            <li className="list-group-item">
              <div className="mb-0 w-100">
                <h4>Flight Times</h4>
                <FlightScheduleControl
                  flightTimes={this.props.teeTimes} scheduleIndex={this.props.scheduleIndex} random_id={this.state.random_id}
                  addTeeTime={this.props.addTeeTime} deleteTeeTime={this.props.deleteTeeTime}/>
              </div>
            </li>
          </ul>
        </div>
        <div className="card-block" ref="cardSummary">
          <p className="card-text">Tee Days: { daysNames.slice(1).map( (e,i) => (<span key={i}>{ this.props.flightSchedule.flight_matrices[0][`day${i+1}`] == 1 ? `${e}; ` : ""}</span>) )}</p>
          <p className="card-text">Tee Times: { this.props.teeTimes.map( (e,i) => (<span key={i}>{e}; </span>)) }</p>
          <p className="card-text">Prices:
            <span>{ toCurrency(this.props.flightSchedule.charge_schedule.session_price)} / </span>
            <span>{ toCurrency(this.props.flightSchedule.charge_schedule.cart)} / </span>
            <span>{ toCurrency(this.props.flightSchedule.charge_schedule.caddy)} / </span>
            <span>{ toCurrency(this.props.flightSchedule.charge_schedule.insurance)} ({this.props.insurance_modes[this.props.flightSchedule.charge_schedule.insurance_mode]}) </span>
          </p>
        </div>
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
    //zeroized the flightSchedules.id if it's null
    var newFlightSchedules = this.props.flightSchedules;

    newFlightSchedules = newFlightSchedules.map((e,i) => {
      e.id = e.id == null ? 0 : e.id;
      e.charge_schedule.id = e.charge_schedule.id == null ? 0 : e.charge_schedule.id;
      e.name = e.name == null ? "" : e.name;

      return e;
    });

    return {
        flightSchedules:this.props.flightSchedules,
        teeTimes:this.props.flightSchedules.map( (e,i) => e.flight_matrices.map( (e2,i2) => e2.tee_time) )
    };
  },
  newSchedule: function(e){
    var  newFlightSchedules = this.state.flightSchedules;
    newFlightSchedules.push(this.props.flightDummy);

    var newTeeTimes = this.state.teeTimes;
    newTeeTimes.push(["07:00am", "07:07am"]);

    this.setState({ flightSchedules:newFlightSchedules, teeTimes:newTeeTimes});
  },
  deleteSchedule: function(e){
    //delete flight schedules

    //can't delete the first one
    if(e.target.dataset.value == 0){
      return;
    }

    console.log('e.target', e.target);
    console.log('delete schedule index', parseInt(e.target.dataset.value,10));
    //figure out why this doesn't work
    var arrayIndex = parseInt(e.target.dataset.value, 10);
    var newFlightSchedules = this.state.flightSchedules;
    var newTeeTimes = this.state.teeTimes;

    newFlightSchedules.splice(arrayIndex,1);
    newTeeTimes.splice(arrayIndex,1);

    this.setState({flightSchedules:newFlightSchedules, teeTimes:newTeeTimes});
  },
  updateFlightInfo: function(e){
    /*update target
      * flight_schedule and
      * associated charge_schedule and
      * flight_matrices days selection
    */
    var newFlightSchedules = this.state.flightSchedules;
    //better way to set this
    if( e.target.dataset.target == "charge_schedule"){
      newFlightSchedules[e.target.dataset.index]["charge_schedule"][`${e.target.dataset.charge}`] = e.target.value;
    } else if (e.target.dataset.target == "flight_matrices") {
      console.log("should change flight_matrices");
      var newDayValue = newFlightSchedules[e.target.dataset.index]["flight_matrices"][0][`day${e.target.dataset.flight}`]
      newDayValue = (newDayValue == 1) ? 0 : 1
      newFlightSchedules[e.target.dataset.index]["flight_matrices"][0][`day${e.target.dataset.flight}`] = newDayValue;
    } else {
      newFlightSchedules[e.target.dataset.index][`${e.target.dataset.target}`] = e.target.value;
    }

    //zeroized if insurance_mode is inclusive
    if(newFlightSchedules[e.target.dataset.index]["charge_schedule"]["insurance_mode"] == 2){
      newFlightSchedules[e.target.dataset.index]["charge_schedule"]["insurance"] = 0;
    }


    this.setState( {flightSchedules:newFlightSchedules});
  },
  addTeeTime: function(e){
    var newTeeTimes = this.state.teeTimes;
    newTeeTimes[e.target.dataset.indexSchedule].push(e.target.dataset.value);
    newTeeTimes[e.target.dataset.indexSchedule].sort();
    this.setState({teeTimes:newTeeTimes});
  },
  deleteTeeTime: function(e){
    //delete tee times
    if(this.state.teeTimes.length > 1){
      var newTeeTimes = this.state.teeTimes;
      newTeeTimes[e.target.dataset.indexSchedule].splice(e.target.dataset.indexTime, 1);
      this.setState({teeTimes:newTeeTimes});
    }
  },
  render: function(){
    return (
      <div className="panel mb-2">
        <div className="collapse panel-collapse" id="flight">
          <div className="card">
            <div className="card-header">Flight Schedules and Pricing</div>
            <div className="card-block">
              Warning: remove flight schedules with caution
            </div>
            <div className="card-block">
              <TaxationBox tax_schedule_path={this.props.tax_schedule_path} />
            </div>
            <div className="card-block">
              { this.state.flightSchedules.map( (e,i) =>
                  <FlightSchedulePriceCard key={i} scheduleIndex={i}
                    flightSchedule={e}
                    teeTimes={this.state.teeTimes[i]} deleteTeeTime={this.deleteTeeTime} addTeeTime={this.addTeeTime}
                    handleClose={this.handleClose} updateFlightInfo={this.updateFlightInfo} insurance_modes={this.props.insurance_modes}
                    deleteSchedule={this.deleteSchedule}
                     />
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

var TaxationBox = React.createClass({
  propTypes: {
    tax_schedule_path:React.PropTypes.string
  },
  getInitialState: function(){
    return {tax_schedules:[], selected:0};
  },
  componentDidMount: function(){
    var handle=this;
    $.getJSON(this.props.tax_schedule_path, null, function(data){
      handle.setState({ tax_schedules:data.tax_schedules, selected:data.selected})
    });
  },
  handleChange: function(e){
      this.setState({selected:e.target.value});
  },
  render: function(){
    return (
        <div className="card">
          <div className="card-header">Taxation</div>
          <div className="card-block">
            <div className="form-group">
              <label>Country:</label>
              <select name="golf_club[tax_schedule_id]" className="form-control" value={this.state.selected} onChange={this.handleChange}>{ this.state.tax_schedules.map( (e,i) =>
                <option key={i} value={e.id}>{e.country} ({e.rate})</option>
              )} </select>
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
      <div className="panel mb-2">
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
    insurance_modes: React.PropTypes.array,
    paths: React.PropTypes.object
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
        location = data.path.admin;

    }).fail(function(jqXHR, textStatus, errorThrown){
      console.log('error:', jqXHR );
      $.snackbar({content:'Errors Detected', style:'error' })
    });
  },
  newCourse: function(e){
    var newClub = this.state.club;
    newClub.course_listings.push(jQuery.extend({}, this.props.dummy_data.course_listing) );
    this.setState({club:newClub});
  },
  deleteCourse: function(e){
    var newClub = this.state.club;
    newClub.course_listings.splice(e.target.dataset.index,1);
    this.setState({club:newClub});
  },
  updateCourse: function(e){
    var newClub = this.state.club;
    //var newCourse = newClub.course_listings[parseInt(e.target.dataset.index)];
    switch(e.target.dataset.attribute){
      case "name":
        newClub.course_listings[parseInt(e.target.dataset.index)].name = e.target.value;
        //newCourse.name = e.target.value;
        break;
      case "course_status_id":
        newClub.course_listings[parseInt(e.target.dataset.index)].course_status_id = e.target.value;
        //newCourse.course_status_id = e.target.value;
        break;
      default: console.log("attribute not found");
    };
    this.setState({club:newClub});
  },
  render: function() {
    var button_label = (this.props.form.method == 'post') ? 'Create!' : 'Update!';

    return (
      <div className="row">
        <div className="col-4">
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
        <div className="col-8">
          <form method={this.props.form.method} action={this.props.form.action_path} ref="golf_form" id="golf_form" >
            <div id="accordion" role="tablist">
              <input type="hidden" name="authenticity_token" value={this.props.form.crsfToken} />
              <GeneralBox club={this.state.club} contentChanged={this.contentChanged} updateLocation={this.updateLocation}
                newCourse={this.newCourse} deleteCourse={this.deleteCourse} updateCourse={this.updateCourse}
                dummyData={this.props.dummy_data} />
              <FlightBox flightSchedules={this.props.flightSchedules} flightDummy={this.props.flightDummy}
               deleteTeeTime={this.deleteTeeTime} newTeeTime={this.newTeeTime} insurance_modes={this.props.insurance_modes}
               tax_schedule_path={this.props.paths.tax_schedule_path} />
              <AmenitiesBox amenities={this.props.amenities}/>
              <button className="btn btn-primary" type="button" disabled={this.state.disabledSubmit} onClick={this.submitForm}>{button_label}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
});
