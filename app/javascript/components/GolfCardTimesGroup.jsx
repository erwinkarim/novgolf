var React = require('react');
var FlightFunctions = require('./FlightFunctions');

var golfCardDefaultOptions = {
    GolfClubTimesShowPrices:true,
    displayCourseGroup:false
};

var GolfCardTimes = React.createClass({
  propTypes: {
    btnGroupMode:React.PropTypes.string, arrayIndex:React.PropTypes.number, adminMode:React.PropTypes.bool ,
    randomID:React.PropTypes.string

  },
  getDefaultProps: function(){
    return {randomID:randomID()};
  },
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
      reserve_status = FlightFunctions.reserveColor(this.props.flight.course_data.status);
      clickFn = this.props.handleClick;
    } else {
      //normal mode
      reserve_status = FlightFunctions.reserveColor(this.props.flight.course_data.status);
      if(reserve_status == "secondary"){
        clickFn = this.props.handleClick;
      } else {
        reserve_status = reserve_status + " disabled";
      }

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
        indicatorClass = FlightFunctions.reserveColor(e.reservation_status);
        if(indicatorClass == "secondary"){
          indicatorClass = null;
        }
        var result = indicatorClass == null ? null : (
          <i key={i} className={`text-${indicatorClass} fa fa-circle`}
            data-value={this.props.index} data-tee-time={this.props.flight.tee_time} data-array-index={this.props.arrayIndex}>
          </i>
        );

        return result;
      })
    )
    : null;

    return (
      <label ref="teeTimeLabel" className={"btn btn-outline-"+reserve_status} onClick={clickFn} data-tee-time={this.props.flight.tee_time}
        id={`btn-group-${this.props.randomID}-${this.props.index}`}
        value={this.props.index} data-value={this.props.index} data-array-index={this.props.arrayIndex}>
        <input type={this.props.btnGroupMode} name="teeTimes[]" value={this.props.flight.tee_time} />
        { prices }
        {courseIndicator}
        {this.props.flight.tee_time}
      </label>
    );
  }
});

var GolfCardTimesGroup = React.createClass({
  propTypes: {
    flights: React.PropTypes.array, btnGroupMode:React.PropTypes.string, arrayIndex:React.PropTypes.number, adminMode:React.PropTypes.bool,
    options: React.PropTypes.object,
    displayMode: React.PropTypes.oneOf(['wrap', 'overflow']),
    randomID:React.PropTypes.string
  },
  getDefaultProps: function(){
      return {
        btnGroupMode:'checkbox', arrayIndex:0, adminMode:false,
        options:golfCardDefaultOptions, displayMode:'wrap',
        randomID:randomID()
      };
  },
  render: function(){
    var golfCards = null;

    var outerClass = this.props.displayMode == 'wrap' ? '' : 'w-100 mw-100';
    var innerClass = this.props.displayMode == 'wrap' ? 'flex-wrap' : 'overflow-x-scroll';

    //console.log("golfcardTimesGroup state.teeTimes = " + this.props.teeTimes)
    if (this.props.flights.length != 0){
     golfCards = (
      <div id={`btn-group-${this.props.randomID}`} className={`btn-group w-100 ${innerClass}`} data-toggle="buttons">{ this.props.flights.sort( function(a,b){
          return a.tee_time < b.tee_time ? -1 : 1;
        }).map( (flight, teeTimeIndex) =>
        <GolfCardTimes key={teeTimeIndex} flight={flight} handleClick={this.props.handleClick}
          index={teeTimeIndex} queryDate={this.props.queryDate}
          btnGroupMode={this.props.btnGroupMode} arrayIndex={this.props.arrayIndex} adminMode={this.props.adminMode}
          randomID={this.props.randomID}
          options={this.props.options} />
      )}</div>
     );
   } else {
     golfCards = (
      <div>
        No schedule detected
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

module.exports = GolfCardTimesGroup;
