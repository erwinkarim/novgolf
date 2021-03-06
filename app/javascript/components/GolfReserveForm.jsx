var React = require('react');
var GolfCardTimesGroup = require('./GolfCardTimesGroup');
var ReserveFormPage = require('./ReserveFormPage');
var FlightFunctions = require('./FlightFunctions');

let FLIGHT_INFO_DEFAULTS = {
      pax:0, member:0, buggy:0, caddy:0, insurance:0, tax:0.00, totalPrice:0.00, members:[], reserved_by:null,
      ur_contact:null, reserve_method:0,
      reservation_id:null, first_course_id:null, second_course_id:null
};

var golfCardDefaultOptions = {
    GolfClubTimesShowPrices:true,
    displayCourseGroup:false
};


/*
  TODO:
    selection criteria based on fuzzy or exact selection
      fuzzy => morning, afternon or evening
      exact => user, given a list of tee time, book everything there.
*/
var GolfReserveForm = React.createClass({
  propTypes: {
    crsfToken: React.PropTypes.string,
    reserveTarget: React.PropTypes.string,
    club: React.PropTypes.object,
    flights: React.PropTypes.array,
    insurance_modes: React.PropTypes.array,
    options: React.PropTypes.object,
    timeGroupDisplay: React.PropTypes.string,
    selectionMode: React.PropTypes.oneOf(['fuzzy', 'exact'])
  },
  getDefaultProps: function(){
    return {
      reserve_target:"/", options: golfCardDefaultOptions,
      timeGroupDisplay:'wrap',
      selectionMode: 'fuzzy'
    }
  },
  getInitialState: function(){
    return {
      //teeTimes:this.props.teeTimes,
      selectedTeeTimes:[],
      selectedTeeTimesIndex: 0,
      flightInfo:[],
      defaultFlightInfo: {pax:0, member:0, buggy:0, caddy:0, insurance:0},
      prices: [],
      random_id: randomID(),
      tax:0,
      totalPrice: 0,
      course_availablity_loaded: false, available_courses: []
    }
  },
  checkAvailableCourses: function(){
    fetch(`/golf_clubs/${this.props.club.id}/open_courses?date=${this.props.queryData.date}`, {
      credentials:'same-origin'
    }).then( (response) => {
      return response.json();
    }).then( (json) => {
      this.setState({course_availablity_loaded:true, available_courses:json.course_listings_id});
    });
  },
  componentDidMount: function(){
    $(this.refs.reserveBtnLi).hide();

    //if this selection mode is fuzzy, pretend click first to load up the flightInfo
    if(this.props.selectionMode == 'fuzzy'){
      this.handleClick({value:0, target:{className:''}, currentTarget:{dataset:{value:0} } });
    };
  },
  componentWillReceiveProps: function(nextProps){
    //TODO: will update new prices when the next props changes in fuzzy mode
    var resetState = ()=>{
      this.setState({
        selectedTeeTimes:[], selectedTeeTimesIndex:0,
        flightInfo:[nextProps.flights[0]], totalPrice:0
      });
      this.updateFlightInfo(
        {value:0, target:{className:''}, currentTarget:{dataset:{value:0} } }
        , nextProps);
    };

    if(nextProps.queryDate != this.props.queryDate){
      console.log('resetState invoke because date changed');
      resetState();
    };

    if(nextProps.flights.length == 0){
      console.log('resetState invoked because flights lenght is zero');
      resetState();
    }


  },
  updateFlightInfo: function(e, props){
    //check if this is inside current state
    var newTeeTimes = this.state.selectedTeeTimes;
    var newIndex = this.state.selectedTeeTimesIndex;
    var newFlightInfo = this.state.flightInfo;
    var value = e.currentTarget.dataset.value;
    var arrayPos = $.inArray(value, newTeeTimes);

    if( arrayPos != -1){
        //console.log('value is in array');
        newTeeTimes.splice(arrayPos, 1);
        newIndex = 0;

        newFlightInfo.splice(arrayPos, 1);
    }else {
      //console.log('value is not in array');
      newTeeTimes.push(value);
      newTeeTimes.sort();
      newIndex = $.inArray(value, newTeeTimes);

      //var fi = Object.assign({}, this.state.defaultFlightInfo);
      var fi = Object.assign({}, FLIGHT_INFO_DEFAULTS);
      Object.assign( fi,
        {
          id:randomID(),
          teeTime:props.flights[value].tee_time,
          first_tee_time:props.flights[value].tee_time,
          second_tee_time:props.flights[value].second_tee_time,
          index:newIndex, flightIndex:value,
          pax:props.flights[value].minPax,
          insurance:props.flights[value].minPax,
          buggy:props.flights[value].minCart,
          caddy:props.flights[value].minCaddy
        }
      );
      newFlightInfo.splice($.inArray(value, newTeeTimes), 0, fi ) ;
    }

    //need to re-adjust each child of flightInfo.index into order as this can be issue when flights are not clicked in-order
    newFlightInfo.map( (e,i) => Object.assign(e, {index:i}));

    this.setState({selectedTeeTimes:newTeeTimes, selectedTeeTimesIndex:newIndex, flightInfo:newFlightInfo});

    /*
      load the course availablity if
      * you can actually choose a course
      * course availablity data is not loaded yet
    */

    if(props.options.displayCourseGroup && !this.state.course_availablity_loaded){
      console.log('check available_courses');
      this.checkAvailableCourses();
    }
    /*
    var newTotalPrice = this.updateTotalPrice();
    var newTax = (newTotalPrice * this.props.club.tax_schedule.rate);
    */
    var totals = FlightFunctions.updateTotals(newFlightInfo, props.flights, props.club)
    this.setState({totalPrice:totals.total, tax:totals.tax});

  },
  updatePrice: function(e){
    var newFlightInfo = this.state.flightInfo;
    var flightIndex = newFlightInfo[e.target.dataset.index].flightIndex;
    var flight = FlightFunctions.updateCount(e, newFlightInfo[e.target.dataset.index], this.props.flights[flightIndex] );

    newFlightInfo[e.target.dataset.index] = flight;

    var totals = FlightFunctions.updateTotals(newFlightInfo, this.props.flights, this.props.club);

    this.setState({flightInfo:newFlightInfo, totalPrice:totals.total, tax:totals.tax});
  },
  handleClick: function(e){
    if(e.target.className.match(/disabled/) != null){
      //ensure that if you click, nothing happens
      e.target.className = e.target.className.replace(/active/, "");
      return;
    }

    this.updateFlightInfo(e,this.props)

  },
  deleteFlight: function(e){
    e.preventDefault();

    var newSelectedTeeTimes = this.state.selectedTeeTimes;
    var newFlightInfo = this.state.flightInfo;
    var targetFlightIndex = e.target.dataset.flightIndex;

    //find the index inside array with matching flightIndex
    //splice from array selectedTeeTimes and flightInfo
    var targetIndex = newSelectedTeeTimes.indexOf(targetFlightIndex);
    newSelectedTeeTimes.splice(targetIndex,1);
    newFlightInfo.splice(targetIndex,1);

    //set selectedTeeTimesIndex to 0
    this.setState({selectedTeeTimes:newSelectedTeeTimes, selectedTeeTimesIndex:0});

    //set the associate button in the button group to untoggle to not active
    $(`#btn-group-${this.state.random_id}-${targetFlightIndex}`).removeClass('active');
  },
  updateSelectedTeeTimesIndex: function(e){
    var newFlightIndex = parseInt(e.target.dataset.flightIndex);
    this.setState({selectedTeeTimesIndex:newFlightIndex});
  },
  render: function(){
    var handle = this;

    //handle slide up and down function here
    //if(this.state.selectedTeeTimes.length >= Math.ceil(this.props.flight.selectedPax/this.props.flight.maxPax)){
    if(this.state.flightInfo.length > 0){
      $(this.refs.reserveBtnLi).slideDown();
    }else{
      $(this.refs.reserveBtnLi).slideUp();
    };

    //return true if the give time frame e is in the current list of tee times
    // format e "06:30" to "20:30"
    var withinTimeFrame = (e) => {
      //cycle through the flight, returns true if found within .5 hours of give time frame
      var startTime = Date.parse(`2000-01-01 ${e.substring(0,2)}:00:00.000Z`);
      var endTime = Date.parse(`2000-01-01 ${e.substring(0,2)}:59:59.000Z`);
      var isWithinTimeFrame = false;

      //cycle through the flight times, return true immediately if the flight between
      // start and end times
      return handle.props.flights.reduce((init, value) => {
        console.log(`init = `, init)
        currentDate = Date.parse(value.tee_time);
        return ((startTime <= currentDate) && (currentDate <= endTime)) || init;
      }, false);
    };

    // enable selection based on tee_time, which is the min tee time available
    var preferredTime = this.props.queryData.session == 'Morning' ? ['06:30', '07:30', '08:30', '09:30', '10:30'] :
      this.props.queryData.session == 'Afternoon' ? ['11:30', '12:30', '13:30', '14:30', '15:30'] :
      this.props.queryData.session == 'Evening' ? ['16:30', '17:30', '18:30', '19:30', '20:30'] :
      ['06:30', '07:30', '08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30','16:30', '17:30', '18:30', '19:30', '20:30']
    ;
    // show card times group on exact selection mode
    var timesGroup = this.props.selectionMode == 'exact' ? (
      <li className="list-group-item">
        <GolfCardTimesGroup randomID={this.state.random_id} flights={this.props.flights} handleClick={this.handleClick} queryDate={this.props.queryDate}
          options={this.props.options} displayMode={this.props.timeGroupDisplay}/>
      </li>
    ) : this.state.flightInfo.length != 0 ? (
      <li className="list-group-item">
        <span> Preferred Time: </span>
        <select className="form-control" name={`flight[${this.state.flightInfo[0].id}][preferred_time]`}>{ preferredTime.map( (e,i) => {
            // check if there's any flights.tee_time within 0.5 hours of e's time
            return (
              <option key={i} value={e}
                disabled={
                  !withinTimeFrame(e)
                }>
                {e}
              </option>
            )
          })
        }</select>
      </li>
    ) : null;

    var flightPages =
      this.state.flightInfo.length == 0 ? null :
      this.props.selectionMode == 'exact' ? (
        <li className="list-group-item">
          <ul className="nav nav-pills mb-2 flex-wrap w-100" id={ "nav-" + this.state.random_id }>{ this.state.selectedTeeTimes.map( (e,i) =>
            {
              var isActive = (this.state.selectedTeeTimesIndex == i) ? "active" : ""
              return (
                <li key={i} className="nav-item">
                  <a href={ `#flight-tab-${this.state.flightInfo[i].id}` } className={`nav-link ${isActive}`} data-toggle="pill"
                    data-flight-index={i} onClick={this.updateSelectedTeeTimesIndex}>
                    {this.props.flights[e].tee_time}
                  </a>
                </li>
              )
            }
          )}</ul>
          <div ref="flightPages" className="tab-content w-100"> { this.state.flightInfo.map( (e,i) =>
            {
              var isActive = (this.state.selectedTeeTimesIndex == i) ? true : false;
              return (
                <ReserveFormPage flightInfo={e} key={i} updatePrice={this.updatePrice} flight={this.props.flights[e.flightIndex]} isActive={isActive}
                  flightIndex={e.flightIndex} deleteFlight={this.deleteFlight}
                  available_courses={this.state.available_courses}
                  insurance_modes={this.props.insurance_modes} options={this.props.options}
                  taxSchedule = {this.props.club.tax_schedule} />
              )
            }
          )}</div>
        </li>
      ) : (
        //should change based on session
        <li className="list-group-item pl-0 pr-0">
          <ReserveFormPage flightInfo={this.state.flightInfo[0]} updatePrice={this.updatePrice} flight={this.props.flights[0]} isActive={true}
            flightIndex={0} deleteFlight={this.deleteFlight}
            available_courses={this.state.available_courses}
            insurance_modes={this.props.insurance_modes} options={this.props.options}
            taxSchedule = {this.props.club.tax_schedule}  displayAs='flushed-list'/>
        </li>
      );

    return (
      <div>
        <form action={this.props.reserveTarget} method="post">
          <input type="hidden" name="authenticity_token" value={this.props.crsfToken} />
          <input type="hidden" name="club[id]" value={this.props.club.id} />
          <input type="hidden" name="info[date]" value={this.props.queryData.date} />
          { timesGroup }
          { flightPages }
          <li className="list-group-item" ref="reserveBtnLi">
            <div className="col-12 text-black">
              <h4>Grand Total: {toCurrency(this.state.totalPrice + this.state.tax)} </h4>
              <input type="hidden" name="info[total_price]" value={this.state.totalPrice} />
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary">Book!</button>
            </div>
          </li>
        </form>
      </div>
    );
  }
});

module.exports = GolfReserveForm
