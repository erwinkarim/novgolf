var golfCardDefaultOptions = {
    GolfClubTimesShowPrices:true,
    displayCourseGroup:false
};

/*
  get the e, the trigger, flightInfo (current state of choose flight) and flight (flight min and max) and update the counts appropiately
  * e must have dataset values {target: info that will be changed, value: the new value}
  * will update the member + pax count to be between flight.minPax and flight.maxPax
  * will update the insurnace count to member + pax if the insurance is inclusive
  * return the updated flightInfo
*/
class flightFunctions {
  static updateCount(e, flightInfo, flight){
    /*
      get the e, the trigger, flightInfo (current state of choose flight) and flight (flight min and max) and update the counts appropiately
      * e must have dataset values {target: info that will be changed, value: the new value}
      * will update the member + pax count to be between flight.minPax and flight.maxPax
      * will update the insurnace count to member + pax if the insurance is inclusive
      * return the updated flightInfo
    */
    flightInfo[e.target.dataset.target] = parseInt(e.target.value);

    if(e.target.dataset.target == "pax" || e.target.dataset.target == "member"){
      //get the min/max pax
      var minPax = flight.minPax;
      var maxPax = flight.maxPax;

      switch (e.target.dataset.target) {
        case "pax":
          //if less than min pax, reset ball count to (minPax - member)
          //if more than max pax, reset member count to be at (maxPax - paxCount)
          if(flightInfo.member + flightInfo.pax < minPax){
            flightInfo.pax = minPax - flightInfo.member;
          }
          if(flightInfo.member + flightInfo.pax > maxPax){
            flightInfo.member = maxPax - flightInfo.pax;
          }
          break;
        case "member":
          //if less than min pax, reset balls to (minpax - member)
          //if more than max pax, reset balls count to be at (maxPax - member)
          if(flightInfo.member + flightInfo.pax < minPax){
            flightInfo.pax = minPax - flightInfo.member;
          }
          if(flightInfo.member + flightInfo.pax > maxPax){
            flightInfo.pax = maxPax - flightInfo.member;
          }
        break;
        default:
      }

      //push empty members data if members.length < member
      if('members' in flightInfo && flightInfo.member > flightInfo.members.length){
        console.log("pushing dummy into members");
        for(var n of arrayFromRange(flightInfo.members.length + 1, flightInfo.member)){
          flightInfo.members.push({name:'', id:''});
        };
      };

      //delete members data if members.length > member
      if('members' in flightInfo && flightInfo.member < flightInfo.members.length){
        var amount_deleted = flightInfo.members.length - flightInfo.member;
        flightInfo.members.splice(flightInfo.members.length - amount_deleted, amount_deleted);
      };
    }

    //update the insurance count automatically if insurance mode is madatory
    if(($.inArray(flight.prices.insurance_mode,[1,2]) != -1) &&
      (e.target.dataset.target == 'pax' || e.target.dataset.target == 'member') ){
        flightInfo.insurance = flightInfo.member + flightInfo.pax;
    }

    //return update flightInfo
    return flightInfo

  }
  static updateTotals(flightInfos, flights, club){
    //get the flightInfo totals, returns an object with {total:X, tax:X, grand_total:x}
    var newTotalPrice = 0;
    flightInfos.map( (e,i) => {
      newTotalPrice += (
        e.pax * parseFloat(flights[e.flightIndex].prices.flight) +
        e.buggy * parseFloat(flights[e.flightIndex].prices.cart) +
        e.caddy * parseFloat(flights[e.flightIndex].prices.caddy) +
        e.insurance * parseFloat(flights[e.flightIndex].prices.insurance)
      )
    });

    var newTax = newTotalPrice * club.tax_schedule.rate;

    return {total:newTotalPrice, tax: newTax, grand_total:newTax + newTotalPrice};

  }
};

var GolfCardTimes = React.createClass({
  propTypes: {btnGroupMode:React.PropTypes.string, arrayIndex:React.PropTypes.number, adminMode:React.PropTypes.bool },
  componentWillReceiveProps: function(nextProps){
      if(this.props.queryDate != nextProps.queryDate){
          //console.log("should disable active");
          $(this.refs.teeTimeLabel).removeClass("active");
      }
  },
  render: function(){
    var reserve_status = "secondary";
    var clickFn = null;
    if(this.props.adminMode){
      //admin mode - disable disabled
      switch ( this.props.flight.course_data.status ){
        case 1: reserve_status = "warning"; break;
        case 2: reserve_status = "danger"; break;
        case 3: reserve_status = "danger"; break;
        case 8: reserve_status = "warning blink"; break;
        default: true;
      }
      clickFn = this.props.handleClick;
    } else {
      //normal mode
      switch ( this.props.flight.course_data.status ){
        case 1: reserve_status = "warning disabled"; break;
        case 8: reserve_status = "warning disabled"; break;
        case 2: reserve_status = "danger disabled"; break; //payment_confirmed
        case 3: reserve_status = "danger disabled"; break; //reservation_confirmed - confirmed by club, not payment not confirmed
        default: clickFn = this.props.handleClick;
      };
    }

    //show the prices
    var prices = this.props.options.GolfClubTimesShowPrices ? (
      <h5 value={this.props.index} data-value={this.props.index} data-arrayIndex={this.props.arrayIndex} >
        {toCurrency(this.props.flight.prices.flight)}
      </h5>
    ) : null ;

    //shouw course indicators, small dots that show course status that is not empty
    var courseIndicator = ("courses" in this.props.flight.course_data) ? (
      this.props.flight.course_data.courses.map( (e,i) => {
        var indicatorClass = null;
        switch (e.reservation_status) {
          case 1: indicatorClass = "warning"; break;
          case 2: indicatorClass = "danger"; break;
          case 3: indicatorClass = "danger"; break;
          case 8: indicatorClass = "warning blink"; break;
          default: indicatorClass = null;
        }
        return (indicatorClass == null ? null : <i key={i} className={`text-${indicatorClass} fa fa-circle`}></i>)
      })
    )
    : null;

    return (
      <label ref="teeTimeLabel" className={"btn btn-"+reserve_status} onClick={clickFn} data-tee-time={this.props.flight.tee_time}
        value={this.props.index} data-value={this.props.index} data-array-index={this.props.arrayIndex}>
        <input type={this.props.btnGroupMode} name="teeTimes[]" value={this.props.flight.tee_time} />
        { prices }
        {courseIndicator} {this.props.flight.tee_time}
      </label>
    );
  }
});

var GolfCardTimesGroup = React.createClass({
  propTypes: {
    flights: React.PropTypes.array, btnGroupMode:React.PropTypes.string, arrayIndex:React.PropTypes.number, adminMode:React.PropTypes.bool,
    options: React.PropTypes.object,
    displayMode: React.PropTypes.oneOf(['wrap', 'overflow'])
  },
  getDefaultProps: function(){
      return { btnGroupMode:'checkbox', arrayIndex:0, adminMode:false, options:golfCardDefaultOptions, displayMode:'wrap'};
  },
  componentDidMount: function(){
      //console.log(this.props)
  },
  render: function(){
    var golfCards = null;

    var outerClass = this.props.displayMode == 'wrap' ? '' : 'w-100 mw-100';
    var innerClass = this.props.displayMode == 'wrap' ? 'flex-wrap' : 'w-100 overflow-x-scroll';

    //console.log("golfcardTimesGroup state.teeTimes = " + this.props.teeTimes)
    if (this.props.flights.length != 0){
     golfCards = (
      <div className={`btn-group ${innerClass}`} data-toggle="buttons">{ this.props.flights.map( (flight, teeTimeIndex) =>
        <GolfCardTimes key={teeTimeIndex} flight={flight} handleClick={this.props.handleClick}
          index={teeTimeIndex} queryDate={this.props.queryDate}
          btnGroupMode={this.props.btnGroupMode} arrayIndex={this.props.arrayIndex} adminMode={this.props.adminMode}
          options={this.props.options} />
      )}</div>
     );
   } else {
     golfCards = (
      <div>
        <i className="fa fa-cog fa-spin"></i> No schedules detected or getting a new one...
      </div>
     );
   };

    return (
      <div className={`${outerClass}`}>
        {golfCards}
      </div>
    );
  }
});

//should which courses are occupied
//should show statuses
var GolfCoursesGroup = React.createClass({
  propTypes:{
      flight: React.PropTypes.object, selectedCourse: React.PropTypes.number
  },
  getDefaultProps: function(){
      return {selectedCourse:0};
  },
  render: function(){
    return (
      <div>
        <p>Courses:</p>
        <div className="btn-group" data-toggle="buttons">{ this.props.flight.course_data.courses.map( (e,i) => {
          var reserve_status = "secondary"
          switch (e.reservation_status) {
            case 1: reserve_status = "warning"; break;
            case 8: reserve_status = "warning blink"; break;
            case 2: reserve_status = "danger"; break;
            case 3: reserve_status = "danger"; break;
            default: reserve_status = "secondary";
          };
          var activeState = (i == this.props.selectedCourse) ? "active" : null;
          return (
            <label className={`btn btn-${reserve_status} ${activeState}`} key={i} onClick={this.props.selectCourse}
              data-index={i} data-course-id={e.id} data-reservation-id={e.reservation_id}>
              <input type="radio" name="courses" value={`course-${e.id}`}  />
              {e.id}
            </label>
          );
        })}</div>
        <p className="card-text">Status: { this.props.flight.course_data.courses[this.props.selectedCourse].reservation_status_text} </p>
        <p className="card-text">
          Selected Course: {this.props.flight.course_data.courses[this.props.selectedCourse].id};
          Reservation ID:{this.props.flight.course_data.courses[this.props.selectedCourse].reservation_id} </p>
      </div>
    );
  }
});

//content of each tab to show how many balls, insurance, etc being choosen for each flight
var ReserveFormPage = React.createClass({
  propTypes: {
    flightInfo:React.PropTypes.object,
    flight:React.PropTypes.object,
    isActive: React.PropTypes.bool,
    options: React.PropTypes.object,
    displayAs: React.PropTypes.oneOf(['card', 'flushed-list'])
  },
  getInitialState: function(){
    return {
      random_id:(Math.floor(Math.random()*16777215).toString(16))
    };
  },
  getDefaultProps: function(){
    return { options: golfCardDefaultOptions, displayAs:'card'};
  },
  rawNote: function(){
    md = new Remarkable();
    //return null;
    return { __html: md.render(this.props.flight.prices.note) };
  },
  render: function(){
    var activeClass = (this.props.isActive) ? "active" : "";
    if(this.props.options.displayCourseGroup){
      golfCourses = (this.props.displayAs == "card") ? (
        <div className="card-block">
          <GolfCoursesGroup flight={this.props.flight} selectCourse={this.props.selectCourse} selectedCourse={this.props.selectedCourse}/>
        </div>
      ) : (
        <li className="list-group-item">
          <GolfCoursesGroup flight={this.props.flight} selectCourse={this.props.selectCourse} selectedCourse={this.props.selectedCourse}/>
        </li>
      );
    } else {
      golfCourses = null;
    }

    var membersLink = (this.props.options.displayMembersModal) ? (
      <a href="#membersModal" data-toggle="modal"> x Members </a>
    ) : " x Members";

    var notesContent = (
      <div>
        <h4>Notes</h4>
        <div dangerouslySetInnerHTML={ this.rawNote()}></div>
        <p>Number of balls in this flight must between {this.props.flight.minPax} and  {this.props.flight.maxPax}. Club T&C applies</p>
      </div>

    );

    var formContent = (
      <div className="w-100">
        <input type="hidden" name={"flight[" + this.props.flightInfo.id + "][matrix_id]"} value={this.props.flight.matrix_id} />
        <input type="hidden" name={"flight[" + this.props.flightInfo.id + "][tee_time]"} value={this.props.flightInfo.teeTime} />
        <div className="form-group row">
          <div className="col-2">
            <select name={ "flight[" + this.props.flightInfo.id + "][count][pax]"}
              onChange={this.props.updatePrice}
              value={this.props.flightInfo.pax} ref="paxCount" className=""
              data-index={this.props.flightInfo.index} data-target="pax">
            { arrayFromRange(0, this.props.flight.maxPax).map( (e,i) =>
              <option key={i}>{e}</option>
            )}</select>
          </div>
          <label className="col-5"> x Balls </label>
          <label className="col-5">
            {toCurrency(this.props.flightInfo.pax * parseFloat(this.props.flight.prices.flight) )}
          </label>
          <input type="hidden" value={this.props.flightInfo.pax*parseFloat(this.props.flight.prices.flight)}
            name={"flight[" + this.props.flightInfo.id + "][price][pax]"} />
        </div>
        <div className="form-group row">
          <div className="col-2">
            <select name={ "flight[" + this.props.flightInfo.id + "][count][member]"}
              onChange={this.props.updatePrice}
              value={this.props.flightInfo.member} ref="memberCount" className=""
              data-index={this.props.flightInfo.index} data-target="member">
            { arrayFromRange(0, this.props.flight.maxPax).map( (e,i) =>
              <option key={i}>{e}</option>
            )}</select>
          </div>
          <label className="col-5">{ membersLink }</label>
          <label className="col-5">RM 0.00 </label>
          <input type="hidden" value="0" name={"flight[" + this.props.flightInfo.id + "][price][member]"} />
        </div>
        <div className="form-group row">
          <div className="col-2">
            <select name={ "flight[" + this.props.flightInfo.id  + "][count][buggy]"}
              onChange={this.props.updatePrice}
              value={this.props.flightInfo.buggy} ref="buggyCount" className=""
              data-index={this.props.flightInfo.index} data-target="buggy">
            { arrayFromRange(this.props.flight.minCart, this.props.flight.maxCart).map( (e,i) =>
              <option key={i}>{e}</option>
            )}</select>
          </div>
          <label className="col-5"> x Buggy </label>
          <label className="col-5">
            {toCurrency(this.props.flightInfo.buggy * parseFloat(this.props.flight.prices.cart) )}
          </label>
          <input type="hidden" value={this.props.flightInfo.buggy * parseFloat(this.props.flight.prices.cart) }
            name={"flight[" + this.props.flightInfo.id + "][price][cart]"} />
        </div>
        <div className="form-group row">
          <div className="col-2">
            <select name={"flight[" + this.props.flightInfo.id + "][count][caddy]"} className=""
                onChange={this.props.updatePrice}
                value={this.props.flightInfo.caddy} ref="caddyCount"
                data-index={this.props.flightInfo.index} data-target="caddy">
              { arrayFromRange(this.props.flight.minCaddy, this.props.flight.maxCaddy).map( (e,i) =>
                <option key={e}>{e}</option>
            )}</select>
          </div>
          <label className="col-5"> x Caddy</label>
          <label className="col-5">
            {toCurrency(this.props.flightInfo.caddy * parseFloat(this.props.flight.prices.caddy) )}
          </label>
          <input type="hidden" value={this.props.flightInfo.caddy * parseFloat(this.props.flight.prices.caddy) }
            name={"flight[" + this.props.flightInfo.id + "][price][caddy]"} />
        </div>
        <div className="form-group row">
          <div className="col-2">
            <select name={"flight[" + this.props.flightInfo.id + "][count][insurance]"} className=""
              onChange={this.props.updatePrice}
              value={this.props.flightInfo.insurance} ref="insuranceCount"
              disabled={ this.props.flight.prices.insurance_mode == 0 ? false : true }
              data-index={this.props.flightInfo.index} data-target="insurance">
            { arrayFromRange($.inArray(this.props.flight.prices.insurance_mode, [1,2]) != -1 ? this.props.flight.minPax : 0, this.props.flight.maxPax ).map( (e,i) =>
                <option key={e}>{e}</option>
            )}</select>
            <input type="hidden" name={"flight[" + this.props.flightInfo.id + "][count][insurance]"} value={this.props.flightInfo.insurance} />
          </div>
          <label className="col-5"> x Insurance</label>
          <label className="col-5">
            {toCurrency(this.props.flightInfo.insurance * parseFloat(this.props.flight.prices.insurance) )}
          </label>
          <input type="hidden" value={this.props.flightInfo.insurance * parseFloat(this.props.flight.prices.insurance) }
            name={"flight[" + this.props.flightInfo.id + "][price][insurance]"} />
        </div>

      </div>
    );

    return this.props.displayAs == 'card' ? (
      <div className={`tab-pane card ${activeClass}`} id={`flight-tab-${this.props.flightInfo.id}`} >
        <div className="card-header" style={ {color:'black'}}>{ this.props.flightInfo.teeTime }</div>
        { golfCourses }
        <div className="card-block text-black">
          { formContent }
          { notesContent }
        </div>
      </div>
    ) : (
      <div className="w-100">
        { golfCourses}
        <li className="list-group-item">
          { formContent}
        </li>
        <li className="list-group-item">
          {notesContent}
        </li>
      </div>
    )
  }
});

//form to reserve flights
var GolfReserveForm = React.createClass({
  propTypes: {
    crsfToken: React.PropTypes.string,
    reserveTarget: React.PropTypes.string,
    club: React.PropTypes.object,
    flights: React.PropTypes.array,
    insurance_modes: React.PropTypes.array,
    options: React.PropTypes.object,
    timeGroupDisplay: React.PropTypes.string
  },
  getDefaultProps: function(){
    return {
      reserve_target:"/", options: golfCardDefaultOptions,
      timeGroupDisplay:'wrap'
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
      totalPrice: 0
    }
  },
  componentDidMount: function(){
    $(this.refs.reserveBtnLi).hide();
  },
  componentWillReceiveProps: function(nextProps){
    if(nextProps.queryDate != this.props.queryDate){
      this.setState({
        selectedTeeTimes:[], selectedTeeTimesIndex:0,
        flightInfo:[], totalPrice:0
      })
    };
  },
  /*
  updateTotalPrice: function(){
      //calculate the new total price
      var newTotalPrice = 0;
      this.state.flightInfo.map( (e,i) => {
          newTotalPrice += (
            e.pax * parseFloat(this.props.flights[e.flightIndex].prices.flight) +
            e.buggy * parseFloat(this.props.flights[e.flightIndex].prices.cart) +
            e.caddy * parseFloat(this.props.flights[e.flightIndex].prices.caddy) +
            e.insurance * parseFloat(this.props.flights[e.flightIndex].prices.insurance)
          )
      });
      return newTotalPrice;
  },
  */
  updatePrice: function(e){
    var newFlightInfo = this.state.flightInfo;
    var flightIndex = newFlightInfo[e.target.dataset.index].flightIndex;
    var flight = flightFunctions.updateCount(e, newFlightInfo[e.target.dataset.index], this.props.flights[flightIndex] );

    newFlightInfo[e.target.dataset.index] = flight;

    var totals = flightFunctions.updateTotals(newFlightInfo, this.props.flights, this.props.club);

    this.setState({flightInfo:newFlightInfo, totalPrice:totals.total, tax:totals.tax});
  },
  handleClick: function(e){
    if(e.target.className.match(/disabled/) != null){
      //ensure that if you click, nothing happens
      e.target.className = e.target.className.replace(/active/, "");
      return;
    } else {
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

        var fi = Object.assign({}, this.state.defaultFlightInfo);
        Object.assign( fi,
          {
            id:randomID(), teeTime:this.props.flights[value].tee_time, index:newIndex, flightIndex:value,
            pax:this.props.flights[value].minPax, insurance:this.props.flights[value].minPax,
              buggy:this.props.flights[value].minCart, caddy:this.props.flights[value].minCaddy
          }
        );
        newFlightInfo.splice($.inArray(value, newTeeTimes), 0, fi ) ;
      }

      //need to re-adjust each child of flightInfo.index into order as this can be issue when flights are not clicked in-order
      newFlightInfo.map( (e,i) => Object.assign(e, {index:i}));

      this.setState({selectedTeeTimes:newTeeTimes, selectedTeeTimesIndex:newIndex, flightInfo:newFlightInfo});
      /*
      var newTotalPrice = this.updateTotalPrice();
      var newTax = (newTotalPrice * this.props.club.tax_schedule.rate);
      */
      var totals = flightFunctions.updateTotals(newFlightInfo, this.props.flights, this.props.club)
      this.setState({totalPrice:totals.total, tax:totals.tax});

    }
  },
  render: function(){
    //handle slide up and down function here
    //if(this.state.selectedTeeTimes.length >= Math.ceil(this.props.flight.selectedPax/this.props.flight.maxPax)){
    if(this.state.flightInfo.length > 0){
      $(this.refs.reserveBtnLi).slideDown();
    }else{
      $(this.refs.reserveBtnLi).slideUp();
    };

    return (
      <form action={this.props.reserveTarget} method="post">
        <input type="hidden" name="authenticity_token" value={this.props.crsfToken} />
        <input type="hidden" name="club[id]" value={this.props.club.id} />
        <input type="hidden" name="info[date]" value={this.props.queryData.date} />
        <li className="list-group-item">
          <GolfCardTimesGroup flights={this.props.flights} handleClick={this.handleClick} queryDate={this.props.queryDate}
            options={this.props.options} displayMode={this.props.timeGroupDisplay}/>
        </li>
        <li className="list-group-item" ref="reserveBtnLi" >
          {/* time stamps */}
          <ul className="nav nav-pills mb-2 flex-wrap w-100" id={ "nav-" + this.state.random_id }>{ this.state.selectedTeeTimes.map( (e,i) =>
            {
              var isActive = (this.state.selectedTeeTimesIndex == i) ? "active" : ""
              return (
                <li key={i} className="nav-item">
                  <a href={ `#flight-tab-${this.state.flightInfo[i].id}` } className={`nav-link ${isActive}`} data-toggle="pill">
                    {this.props.flights[e].tee_time}
                  </a>
                </li>
              )
            }
          )}</ul>
          <br />

          {/* form pages */}
          <div ref="flightPages" className="tab-content"> { this.state.flightInfo.map( (e,i) =>
            {
              var isActive = (this.state.selectedTeeTimesIndex == i) ? true : false;
              return (
                <ReserveFormPage flightInfo={e} key={i} updatePrice={this.updatePrice} flight={this.props.flights[e.flightIndex]} isActive={isActive}
                  insurance_modes={this.props.insurance_modes} options={this.props.options} />
              )
            }
          )}</div>
          <div className="col-12 text-black">
            <h5>Tax: {toCurrency(this.state.tax)}</h5>
            <h4>Grand Total: {toCurrency(this.state.totalPrice + this.state.tax)} </h4>
            <input type="hidden" name="info[total_price]" value={this.state.totalPrice} />
          </div>
          <button type="submit" className="btn btn-primary">Book!</button>
          </li>
        </form>
      )
    }
});

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
          <form>
            <fieldset className="form-group">
              <label>I have <select>{ [2,3,4,5,6,7,8].map( (e,i) => <option key={i}>{e}</option> ) } </select> balls
              </label>
            </fieldset>
            <fieldset className="form-group">
              <input type="text" className="datepicker form-control" ref="queryDate" name="dateQuery" value={this.state.queryDate}
              style={ {zIndex:1000, position:'relative'}} onChange={this.dateChanged }/>
            </fieldset>
          </form>
        </li>
        <GolfReserveForm crsfToken={this.props.crsfToken} reserveTarget={this.props.paths.reserve}
          club={this.props.club} flights={this.state.flights} queryData={this.state.queryData}
          insurance_modes={this.props.insurance_modes} options={this.props.options } timeGroupDisplay='overflow'/>
      </ul>
    );
  }
});

var GolfCards = React.createClass({
  propTypes: {
    crsfToken: React.PropTypes.string,
    club: React.PropTypes.object,
    paths: React.PropTypes.object,
    queryData: React.PropTypes.object,
    flights: React.PropTypes.array,
    options: React.PropTypes.object
  },
  getDefaultProps:function(){
      return {options: golfCardDefaultOptions }
  },
  getInitialState: function(){
      return { teeTimes:[], totalPrice: 0, random_id:randomID() }
  },
  componentDidMount: function(){
      //console.log(this.props);
      $(this.refs.reserveBtnLi).hide();
  },
  render: function() {
    //either get generic or scheduled image
    var photoPath, hasCarousel;
    if(this.props.club.photos.length == 0) {
      photoPath = this.props.paths.img;
      hasCarousel = false;
    }else {
      photoPath = this.props.club.photos[0];
      hasCarousel = true;
    };

    var carouselDiv = (
      <div className="carousel" data-ride="carousel" id={`carousel-${this.state.random_id}`}>
        <ol className="carousel-indicators">
          <li data-target={`#carousel-${this.state.random_id}`} data-slide-to="0" className="active"></li>
          <li data-target={`#carousel-${this.state.random_id}`} data-slide-to="1"></li>
          <li data-target={`#carousel-${this.state.random_id}`} data-slide-to="2"></li>
        </ol>
        <div className="carousel-inner" role="listbox">{
          this.props.club.photos.map( (e,i) => (
              <div key={i} className={`carousel-item ${i==0 ? "active" : ""}`} >
                <img className="img-responsive card-img-top" src={e} />
              </div>
          ))
        }</div>
      </div>
    );

    return (
      <div className="card card-inverse d-inline-block">
        { hasCarousel ? (carouselDiv) : (<img className="img-responsive card-img-top" src={photoPath} />) }
        <a href={this.props.paths.club} target="_blank">
          <div className="card-img-overlay">
              <h4 className="card-title text-shadow">{ toCurrency(Math.min.apply(null, this.props.flights.map( (e,i) => parseFloat(e.prices.flight))) )}</h4>
              <h4 className="card-title text-shadow">{this.props.club.name}</h4>
          </div>
        </a>
        <ul className="list-group-flush list-group">
          <GolfReserveForm crsfToken={this.props.crsfToken} reserveTarget={this.props.paths.reserve}
            club={this.props.club} flights={this.props.flights} queryData={this.props.queryData}
            insurance_modes={this.props.insurance_modes} options={this.props.options} />
        </ul>
      </div>
    );
  }
});
