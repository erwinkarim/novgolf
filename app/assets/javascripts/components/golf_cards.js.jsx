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
        <input key={this.props.teeTime.matrix_id} type="checkbox" name="teeTimes[]" value={[this.props.teeTime.tee_time, this.props.teeTime.matrix_id]} />
        {this.props.teeTime.tee_time}
      </label>
    );
  }
});

var GolfCardTimesGroup = React.createClass({
  componentDidMount: function(){
      //console.log(this.props)
  },
  render: function(){
   return (
    <div className="btn-group" data-toggle="buttons">{ this.props.teeTimes.map( (teeTime, teeTimeIndex) =>
      <GolfCardTimes key={teeTimeIndex} teeTime={teeTime} handleClick={this.props.handleClick} />
    )}</div>
   );
  }
})

var GolfCards = React.createClass({
  propTypes: {
    crsfToken: React.PropTypes.string,
    club: React.PropTypes.object,
    paths: React.PropTypes.object,
    prices: React.PropTypes.object,
    teeTimes: React.PropTypes.array,
    flight: React.PropTypes.object
  },
  getInitialState: function(){
      return { teeTimes:[], totalPrice: this.props.prices.flight*this.props.flight.selectedPax }
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
      console.log("newState : " + newState);

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
  },
  render: function() {
    return (
      <div className="col-xs-12 col-md-6 col-lg-6" key={this.props.club.id}>
        <div className="card card-inverse">
          <img className="img-responsive card-img-top" src={this.props.paths.img} />
          <div className="card-img-overlay">
            <a href={this.props.paths.club} target="_blank">
              <h4 className="card-title">{this.props.prices.flight}</h4>
              <h4 className="card-title">{this.props.club.name}</h4>
            </a>
          </div>
          <ul className="list-group-flush list-group">
            <form action={this.props.paths.reserve} method="post">
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
                <div className="form-group row">
                  <div className="col-xs-2">
                    <select name="flight[pax]" onChange={this.updatePrice} ref="paxCount" className="from-control">{ [2,3,4].map( (e,i) =>
                      <option key={i}>{e}</option>
                    )}</select>
                  </div>
                  <label className="col-xs-6"> x Balls </label>
                  <label className="col-xs-4">{this.props.prices.flight}</label>
                  <input type="hidden" value={this.props.prices.flight} name="price[pax]" />
                </div>
                <div className="form-group row">
                  <div className="col-xs-2">
                    <select className="from-control" onChange={this.updatePrice} ref="cartCount" name="flight[cart]">{ [0,1,2].map( (e,i) =>
                      <option key={i}>{e}</option>
                    )}</select>
                  </div>
                  <label className="col-xs-6"> x Buggy </label>
                  <label className="col-xs-4">{this.props.prices.cart}</label>
                  <input type="hidden" value={this.props.prices.cart} name="price[cart]" />
                </div>
                <div className="form-group row">
                  <div className="col-xs-2">
                    <select className="from-control" onChange={this.updatePrice} ref="caddyCount" name="flight[caddy]">{ [0,1,2].map( (e,i) =>
                      <option key={e}>{e}</option>
                    )}</select>
                  </div>
                  <label className="col-xs-6"> x Caddy</label>
                  <label className="col-xs-4">{ this.props.prices.caddy}</label>
                  <input type="hidden" value={this.props.prices.caddy} name="price[caddy]" />
                </div>
                <div className="form-group row">
                  <div className="col-xs-2">
                    <select className="from-control" onChange={this.updatePrice} ref="insuranceCount" name="flight[insurance]">{ [0,1,2].map( (e,i) =>
                      <option key={e}>{e}</option>
                    )}</select>
                  </div>
                  <label className="col-xs-6"> x Insurance</label>
                  <label className="col-xs-4">{ this.props.prices.insurance}</label>
                  <input type="hidden" value={this.props.prices.insurance} name="price[insurance]" />
                </div>
                <div className="row">
                  <label className="col-xs-6 col-xs-offset-2">Total: </label>
                  <label className="col-xs-4">{this.state.totalPrice}</label>
                  <input type="hidden" value={this.state.totalPrice} name="price[total]" />
                </div>
                <button type="submit" className="btn btn-primary">Book!</button>
              </li>
            </form>
          </ul>
        </div>
      </div>
    );
  }
});
