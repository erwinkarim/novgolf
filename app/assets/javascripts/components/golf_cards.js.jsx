var GolfCardTimes = React.createClass({
  render: function(){
    var reserve_status = "secondary";
    if ( this.props.teeTime.reserve_status == 1 ){
      reserve_status = "warning disabled";
    } else if ( this.props.teeTime.reserve_status == 2 ){
      reserve_status = "danger disabled";
    };

    return (
      <label className={"btn btn-"+reserve_status} onClick={this.props.handleClick} data-tee-time={this.props.teeTime.tee_time}>
        <input type="checkbox" name="teeTimes[]" value={[this.props.teeTime.tee_time, this.props.teeTime.matrix_id]} />
        <h5>{toCurrency(this.props.teeTime.prices.flight)}</h5>
        {this.props.teeTime.tee_time}
      </label>
    );
  }
});

var GolfCardTimesGroup = React.createClass({
  propTypes: {
      teeTimes: React.PropTypes.array
  },
  componentDidMount: function(){
      //console.log(this.props)
  },
  render: function(){
    var golfCards = null;
    //console.log("golfcardTimesGroup state.teeTimes = " + this.props.teeTimes)
    if (this.props.teeTimes.length != 0){
     golfCards = (
      <div className="btn-group" data-toggle="buttons">{ this.props.teeTimes.map( (teeTime, teeTimeIndex) =>
        <GolfCardTimes key={teeTimeIndex} teeTime={teeTime} handleClick={this.props.handleClick} />
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

//content of each tab to show how many balls, insurance, etc being choosen for each flight
var ReserveFormPage = React.createClass({
  propTypes: {
    isVisible: React.PropTypes.bool,
    prices: React.PropTypes.object
  },
  getInitialState: function(){
    return {
      random_id:(Math.floor(Math.random()*16777215).toString(16))
    };
  },
  getDefaultProps: function(){
    return {
        isVisible:false
    };
  },
  render: function(){
    return (
      <div>
        <div className="form-group row">
          <div className="col-xs-2">
            <select name="flight[pax]" onChange={this.props.updatePrice} ref="paxCount" className="from-control">{ [2,3,4].map( (e,i) =>
              <option key={i}>{e}</option>
            )}</select>
          </div>
          <label className="col-xs-6"> x Balls </label>
          <label className="col-xs-4">{0}</label>
          <input type="hidden" value={0} name="price[pax]" />
        </div>
        <div className="form-group row">
          <div className="col-xs-2">
            <select className="from-control" onChange={this.props.updatePrice} ref="cartCount" name="flight[cart]">{ [0,1,2].map( (e,i) =>
              <option key={i}>{e}</option>
            )}</select>
          </div>
          <label className="col-xs-6"> x Buggy </label>
          <label className="col-xs-4">{0}</label>
          <input type="hidden" value={0} name="price[cart]" />
        </div>
        <div className="form-group row">
          <div className="col-xs-2">
            <select className="from-control" onChange={this.props.updatePrice} ref="caddyCount" name="flight[caddy]">{ [0,1,2].map( (e,i) =>
              <option key={e}>{e}</option>
            )}</select>
          </div>
          <label className="col-xs-6"> x Caddy</label>
          <label className="col-xs-4">{0}</label>
          <input type="hidden" value={0} name="price[caddy]" />
        </div>
        <div className="form-group row">
          <div className="col-xs-2">
            <select className="from-control" onChange={this.props.updatePrice} ref="insuranceCount" name="flight[insurance]">{ [0,1,2].map( (e,i) =>
              <option key={e}>{e}</option>
            )}</select>
          </div>
          <label className="col-xs-6"> x Insurance</label>
          <label className="col-xs-4">{0}</label>
          <input type="hidden" value={0} name="price[insurance]" />
        </div>
        <div className="row">
          <label className="col-xs-6 col-xs-offset-2">Total: </label>
          <label className="col-xs-4">{this.props.totalPrice}</label>
          <input type="hidden" value={this.props.totalPrice} name="price[total]" />
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
      flight: React.PropTypes.object,
      prices: React.PropTypes.object,
      teeTimes: React.PropTypes.array
    },
    getInitialState: function(){
      return {
        //teeTimes:this.props.teeTimes,
        selectedTeeTimes:[],
        selectedTeeTimesIndex: 0,
        prices: [],
        totalPrice: 0
      }
    },
    componentDidMount: function(){
      $(this.refs.reserveBtnLi).hide();
    },
    updatePrice: function(e){
      //update the total price
      var newTotalPrice = 0;
      this.setState( { totalPrice: newTotalPrice });
    },
    handleClick: function(e){
      if(e.target.className.match(/disabled/) != null){
        e.target.className = e.target.className.replace(/active/, "");
        return;
      } else {
        var handle = $(e.target)
        var newState = [];
        handle.parent().children().each(function(i,e){
          if($(e).hasClass('active')){
            newState.push( $(e).data('tee-time'));
          }
        });
        this.setState( { selectedTeeTimes: newState })
        //console.log(this.state)
      }
    },
    getDefaultProps: function(){
      return {
        teeTimes:[],
        reserve_target:"/"
      }
    },
    componentWillReceiveProps: function(nextProps){
      if(nextProps.teeTimes.length == 0){
        this.setState({selectedTeeTimes:[]})
      }
    },
    render: function(){
      //handle slide up and down function here
      if(this.state.selectedTeeTimes.length >= Math.ceil(this.props.flight.selectedPax/this.props.flight.maxPax)){
        $(this.refs.reserveBtnLi).slideDown();
      }else{
        $(this.refs.reserveBtnLi).slideUp();
      };

      return (
        <form action={this.props.reserveTarget} method="post">
          <input type="hidden" name="authenticity_token" value={this.props.crsfToken} />
          <input type="hidden" name="club[id]" value={this.props.club.id} />
          <input type="hidden" name="flight[date]" value={this.props.flight.date} />
          <li className="list-group-item">
            <div>
              You must choose at least {Math.ceil(this.props.flight.selectedPax/this.props.flight.maxPax)} flight(s)
            </div>
            <GolfCardTimesGroup teeTimes={this.props.teeTimes} handleClick={this.handleClick} />
          </li>
          <li className="list-group-item" ref="reserveBtnLi" >
            {/* time stamps */}
            <SelectedTimeNav selectedTeeTimes={this.state.selectedTeeTimes} selectedIndex={this.state.selectedTeeTimesIndex} />
            <br />
            <ReserveFormPage prices={this.props.prices} totalPrice={this.state.totalPrice}
              updatePrice={this.updatePrice} visibleIndex={this.state.selectedTeeTimesIndex} />
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
      reserve_target: React.PropTypes.string,
      path: React.PropTypes.object,
      golf_club_id: React.PropTypes.number,
      queryDate: React.PropTypes.string,
      flight: React.PropTypes.object,
      teeTimes: React.PropTypes.array
    },
    getDefaultProps: function(){
      return {
          reserve_target: "/"
      };
    },
    getInitialState: function(){
        return {
          queryDate: this.props.flight.date,
          flight: this.props.flight,
          teeTimes:this.props.teeTimes
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
      //console.log("changed date start get schedule for new date");

      var newFlight = this.state.flight;
      var newTeeTimes = null;
      var handle = this;
      newFlight.date = e;

      //set init
      this.setState({queryDate:e, teeTimes:[],flight:newFlight});

      //get updated teeTimes
      $.getJSON(this.props.path.golfClub, { date:e },  function(data){
          newTeeTimes = data.tee_times;
          handle.setState({teeTimes:newTeeTimes});
      });


      //actually get the latest schedule based on the new dates
    },
    render: function(){
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
          <GolfReserveForm crsfToken={this.props.crsfToken} club={this.props.club} teeTimes={this.state.teeTimes} prices={this.props.prices}
            reserveTarget={this.props.path.reserveTarget} flight={this.state.flight}/>
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
    teeTimes: React.PropTypes.array,
    flight: React.PropTypes.object
  },
  getInitialState: function(){
      return { teeTimes:[], totalPrice: 0}
  },
  handleClick: function(e){
    if(e.target.className.match(/disabled/) != null){
      e.target.className = e.target.className.replace(/active/, "");
      return;
    } else {
      var handle = $(e.target)
      var newState = [];
      handle.parent().children().each(function(i,e){
        if($(e).hasClass('active')){
          newState.push( $(e).data('tee-time'));
        }
      });
      this.setState( { teeTimes: newState })
      //console.log("newState : " + newState);

      if(newState.length >= Math.ceil(this.props.flight.selectedPax/this.props.flight.maxPax)){
        $(this.refs.reserveBtnLi).slideDown();
      }else{
        $(this.refs.reserveBtnLi).slideUp();
      }
    }
  },
  updatePrice: function(e){
    //update the total price
    var newTotalPrice = (this.refs.paxCount.value * this.props.prices.flight) +
    (this.refs.caddyCount.value * this.props.prices.caddy) +
    (this.refs.cartCount.value * this.props.prices.cart) +
    (this.refs.insuranceCount.value * this.props.prices.insurance);
    this.setState( { totalPrice: newTotalPrice });
  },
  componentDidMount: function(){
      //console.log(this.props);
      $(this.refs.reserveBtnLi).hide();
      console.log("prices ", this.props.teeTimes.map( (e,i) => parseInt(e.prices.flight)) );
  },
  render: function() {
    return (
      <div className="col-xs-12 col-md-6 col-lg-6" key={this.props.club.id}>
        <div className="card card-inverse">
          <img className="img-responsive card-img-top" src={this.props.paths.img} />
          <a href={this.props.paths.club} target="_blank">
            <div className="card-img-overlay">
                <h4 className="card-title">{ toCurrency(Math.min.apply(null, this.props.teeTimes.map( (e,i) => parseFloat(e.prices.flight))) )}</h4>
                <h4 className="card-title">{this.props.club.name}</h4>
            </div>
          </a>
          <ul className="list-group-flush list-group">
            <GolfReserveForm crsfToken={this.props.crsfToken}
              teeTimes={this.props.teeTimes} reserveTarget={this.props.paths.reserve}
              club={this.props.club} flight={this.props.flight} prices={this.props.prices} />
          </ul>
        </div>
      </div>
    );
  }
});
