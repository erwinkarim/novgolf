var GolfCardTimes = React.createClass({
  render: function(){
    var reserve_status = "secondary";
    if ( this.props.flight.reserve_status == 1 ){
      reserve_status = "warning disabled";
    } else if ( this.props.flight.reserve_status == 2 ){
      reserve_status = "danger disabled";
    };

    return (
      <label className={"btn btn-"+reserve_status} onClick={this.props.handleClick} data-tee-time={this.props.flight.tee_time}
        value={this.props.index}>
        <input type="checkbox" name="teeTimes[]" value={this.props.flight.tee_time} />
        <h5 value={this.props.index} >{toCurrency(this.props.flight.prices.flight)}</h5>
        {this.props.flight.tee_time}
      </label>
    );
  }
});

var GolfCardTimesGroup = React.createClass({
  propTypes: {
    flights: React.PropTypes.array
  },
  componentDidMount: function(){
      //console.log(this.props)
  },
  render: function(){
    var golfCards = null;
    //console.log("golfcardTimesGroup state.teeTimes = " + this.props.teeTimes)
    if (this.props.flights.length != 0){
     golfCards = (
      <div className="btn-group" data-toggle="buttons">{ this.props.flights.map( (flight, teeTimeIndex) =>
        <GolfCardTimes key={teeTimeIndex} flight={flight} handleClick={this.props.handleClick} index={teeTimeIndex} />
      )}</div>
     );
   } else {
     golfCards = (
      <i className="fa fa-cog fa-spin"></i>
     );
   };

    return (
      <div>
        {golfCards}
      </div>
    );
  }
});

//tabs to show which flights are being selected
/*
var SelectedTimeNav = React.createClass({
    propTypes: {
        selectedTeeTimes: React.PropTypes.array,
        selectedIndex: React.PropTypes.number
    },
    handleClick: function(e){
        e.preventDefault();
    },
    render: function(){

      return (
          <ul className="nav nav-tabs">{ this.props.selectedTeeTimes.map( (e,i) =>
            {
              var isActive = (i != 0) ? "active" : "";
              return (
                <li key={i} className="nav-item">
                  <a className={"nav-link active" + isActive} onClick={this.handleClick} href="#">{e}</a>
                </li>
              )
            }
          )}</ul>
      )
    }
});
*/

//content of each tab to show how many balls, insurance, etc being choosen for each flight
var ReserveFormPage = React.createClass({
  propTypes: {
    flightInfo:React.PropTypes.object,
    flight:React.PropTypes.object
  },
  getInitialState: function(){
    return {
      random_id:(Math.floor(Math.random()*16777215).toString(16))
    };
  },
  render: function(){
    return (
      <div className="card" id={this.props.flightInfo.id} >
        <input type="hidden" name={"flight[" + this.props.flightInfo.id + "][matrix_id]"} value={this.props.flight.matrix_id} />
        <input type="hidden" name={"flight[" + this.props.flightInfo.id + "][tee_time]"} value={this.props.flightInfo.teeTime} />
        <div className="card-header" style={ {color:'black'}}>{ this.props.flightInfo.teeTime }</div>
        <div className="card-block">
          <div className="form-group row">
            <div className="col-xs-2">
              <select name={ "flight[" + this.props.flightInfo.id + "][count][pax]"}
                onChange={this.props.updatePrice}
                value={this.props.flightInfo.pax} ref="paxCount" className=""
                data-index={this.props.flightInfo.index} data-target="pax">
              { [2,3,4].map( (e,i) =>
                <option key={i}>{e}</option>
              )}</select>
            </div>
            <label className="col-xs-5"> x Balls </label>
            <label className="col-xs-5">
              {toCurrency(this.props.flightInfo.pax * parseFloat(this.props.flight.prices.flight) )}
            </label>
            <input type="hidden" value={this.props.flightInfo.pax*parseFloat(this.props.flight.prices.flight)}
              name={"flight[" + this.props.flightInfo.id + "][price][pax]"} />
          </div>
          <div className="form-group row">
            <div className="col-xs-2">
              <select name={ "flight[" + this.props.flightInfo.id  + "][count][buggy]"}
              onChange={this.props.updatePrice}
              value={this.props.flightInfo.buggy} ref="buggyCount" className=""
              data-index={this.props.flightInfo.index} data-target="buggy">{ [0,1,2].map( (e,i) =>
                <option key={i}>{e}</option>
              )}</select>
            </div>
            <label className="col-xs-5"> x Buggy </label>
            <label className="col-xs-5">
              {toCurrency(this.props.flightInfo.buggy * parseFloat(this.props.flight.prices.cart) )}
            </label>
            <input type="hidden" value={this.props.flightInfo.buggy * parseFloat(this.props.flight.prices.cart) }
              name={"flight[" + this.props.flightInfo.id + "][price][cart]"} />
          </div>
          <div className="form-group row">
            <div className="col-xs-2">
              <select name={"flight[" + this.props.flightInfo.id + "][count][caddy]"} className=""
                onChange={this.props.updatePrice}
                value={this.props.flightInfo.caddy} ref="caddyCount"
                data-index={this.props.flightInfo.index} data-target="caddy">{ [0,1,2].map( (e,i) =>
                  <option key={e}>{e}</option>
              )}</select>
            </div>
            <label className="col-xs-5"> x Caddy</label>
            <label className="col-xs-5">
              {toCurrency(this.props.flightInfo.caddy * parseFloat(this.props.flight.prices.caddy) )}
            </label>
            <input type="hidden" value={this.props.flightInfo.caddy * parseFloat(this.props.flight.prices.caddy) }
              name={"flight[" + this.props.flightInfo.id + "][price][caddy]"} />
          </div>
          <div className="form-group row">
            <div className="col-xs-2">
              <select name={"flight[" + this.props.flightInfo.id + "][count][insurance]"} className=""
                onChange={this.props.updatePrice}
                value={this.props.flightInfo.insurance} ref="insuranceCount"
                data-index={this.props.flightInfo.index} data-target="insurance">{ [2,3,4].map( (e,i) =>
                  <option key={e}>{e}</option>
              )}</select>
            </div>
            <label className="col-xs-5"> x Insurance</label>
            <label className="col-xs-5">
              {toCurrency(this.props.flightInfo.insurance * parseFloat(this.props.flight.prices.insurance) )}
            </label>
            <input type="hidden" value={this.props.flightInfo.insurance * parseFloat(this.props.flight.prices.insurance) }
              name={"flight[" + this.props.flightInfo.id + "][price][insurance]"} />
          </div>
          <h4>Notes</h4>
          <p className="card-text" style={ {color:'black'}}>{ this.props.flight.prices.note}</p>
        </div>
      </div>
    )
  }
});

//form to reserve flights
// have to think about when teeTimes goes blank because it's being loaded
var GolfReserveForm = React.createClass({
    propTypes: {
      crsfToken: React.PropTypes.string,
      reserveTarget: React.PropTypes.string,
      club: React.PropTypes.object,
      flights: React.PropTypes.array
    },
    getInitialState: function(){
      return {
        //teeTimes:this.props.teeTimes,
        selectedTeeTimes:[],
        selectedTeeTimesIndex: 0,
        flightInfo:[],
        defaultFlightInfo: {pax:0, buggy:0, caddy:0, insurance:0},
        prices: [],
        random_id: randomID(),
        totalPrice: 0
      }
    },
    componentDidMount: function(){
      $(this.refs.reserveBtnLi).hide();
    },
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
    updatePrice: function(e){
        var handle = $(e.target);
        console.log('new value is ', e.target.value  );

        var newFlightInfo = this.state.flightInfo;
        newFlightInfo[handle.data('index')][handle.data('target')] = parseInt(e.target.value);

        var newTotalPrice = this.updateTotalPrice();

        this.setState({flightInfo:newFlightInfo, totalPrice:newTotalPrice});


    },
    handleClick: function(e){
      //console.log('clicked ', e.target.value)

      //update the selected TeeTimes and current teeTimes index

      if(e.target.className.match(/disabled/) != null){
        //ensure that if you click, nothing happens
        e.target.className = e.target.className.replace(/active/, "");
        return;
      } else {
        //check if this is inside current state
        var newTeeTimes = this.state.selectedTeeTimes;
        var newIndex = this.state.selectedTeeTimesIndex;
        var newFlightInfo = this.state.flightInfo;
        var value = e.target.value;
        var arrayPos = $.inArray(value, newTeeTimes);

        if( arrayPos != -1){
            console.log('value is in array');
            newTeeTimes.splice(arrayPos, 1);
            newIndex = 0;

            newFlightInfo.splice(arrayPos, 1);
        }else {
            console.log('value is not in array');
            newTeeTimes.push(value);
            newTeeTimes.sort();
            newIndex = $.inArray(value, newTeeTimes);

            var fi = Object.assign({}, this.state.defaultFlightInfo);
            Object.assign( fi,
              {
                id:randomID(), teeTime:this.props.flights[value].tee_time, index:newIndex, flightIndex:value,
                pax:this.props.flights[value].minPax, insurance:this.props.flights[value].minPax
              }
            );
            newFlightInfo.splice($.inArray(value, newTeeTimes), 0, fi ) ;
            console.log("newFlightInfo = ", newFlightInfo);
        }

        this.setState({selectedTeeTimes:newTeeTimes, selectedTeeTimesIndex:newIndex, flightInfo:newFlightInfo});
        var newTotalPrice = this.updateTotalPrice();
        this.setState({totalPrice:newTotalPrice});

        /*
        var handle = $(e.target)
        var newState = [];
        handle.parent().children().each(function(i,e){
          if($(e).hasClass('active')){
            newState.push( $(e).data('tee-time'));
          }
        });
        this.setState( { selectedTeeTimes: newState })
        //console.log(this.state)
        */
      }
    },
    getDefaultProps: function(){
      return {
        reserve_target:"/"
      }
    },
    componentWillReceiveProps: function(nextProps){
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
            <GolfCardTimesGroup flights={this.props.flights} handleClick={this.handleClick} />
          </li>
          <li className="list-group-item" ref="reserveBtnLi" >
            {/* time stamps */}
            <ul className="nav nav-pills" id={ "nav-" + this.state.random_id }>{ this.state.selectedTeeTimes.map( (e,i) =>
              {
                var isActive = (i == this.state.selectedTeeTimesIndex) ? "active" : "";
                return (
                  <li className="nav-item">
                    <a href={ "#" + this.state.flightInfo[i].id } className={"nav-link " + isActive }>{this.props.flights[e].tee_time}</a>
                  </li>
                )
              }
            )}</ul>
            <br />

            {/* form pages */}
            <div data-spy="scroll" data-target={"#nav-" + this.state.random_id } >
              { this.state.flightInfo.map( (e,i) =>
                <ReserveFormPage flightInfo={e} key={i} updatePrice={this.updatePrice} flight={this.props.flights[e.flightIndex]} />
              )}
            </div>
            <div>
              <h4>Grand Total: {toCurrency(this.state.totalPrice)} </h4>
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
    },
    getDefaultProps: function(){
      return {
          paths: { reserve:"/", golfClub:"/"}
      };
    },
    getInitialState: function(){
        return {
          queryDate: this.props.queryDate,
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
        handle.setState({flights:data.flights, queryDate:e})
      });


      //actually get the latest schedule based on the new dates
    },
    render: function(){
      /*
          <GolfReserveForm crsfToken={this.props.crsfToken} club={this.props.club} teeTimes={this.state.teeTimes} prices={this.props.prices}
            reserveTarget={this.props.path.reserveTarget} flight={this.state.flight}/>
      */
      return (
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            <fieldset className="form-group">
              <label>I have <select>{
                  [2,3,4,5,6,7,8].map( (e,i) =>
                      <option key={i}>{e}</option>
                  )
                }
                </select> balls
              </label>
            </fieldset>
            <fieldset className="form-group">
              <input type="text" className="datepicker form-control" ref="queryDate" name="dateQuery" value={this.state.queryDate}
              style={ {zIndex:1000, position:'relative'}} onChange={this.dateChanged }/>
            </fieldset>
          </li>
          <GolfReserveForm crsfToken={this.props.crsfToken} reserveTarget={this.props.paths.reserve}
            club={this.props.club} flights={this.state.flights} queryData={this.props.queryData} />
        </ul>
      );
    }
});

/*

  TODO: need to handle multiple flight schedule selection and others
*/
var GolfCards = React.createClass({
  propTypes: {
    crsfToken: React.PropTypes.string,
    club: React.PropTypes.object,
    paths: React.PropTypes.object,
    queryData: React.PropTypes.object,
    flights: React.PropTypes.array
  },
  getInitialState: function(){
      return { teeTimes:[], totalPrice: 0}
  },
  componentDidMount: function(){
      //console.log(this.props);
      $(this.refs.reserveBtnLi).hide();
  },
  render: function() {
    return (
      <div className="col-xs-12 col-md-6 col-lg-6" key={this.props.club.id}>
        <div className="card card-inverse">
          <img className="img-responsive card-img-top" src={this.props.paths.img} />
          <a href={this.props.paths.club} target="_blank">
            <div className="card-img-overlay">
                <h4 className="card-title">{ toCurrency(Math.min.apply(null, this.props.flights.map( (e,i) => parseFloat(e.prices.flight))) )}</h4>
                <h4 className="card-title">{this.props.club.name}</h4>
            </div>
          </a>
          <ul className="list-group-flush list-group">
            <GolfReserveForm crsfToken={this.props.crsfToken} reserveTarget={this.props.paths.reserve}
              club={this.props.club} flights={this.props.flights} queryData={this.props.queryData} />
          </ul>
        </div>
      </div>
    );
  }
});
