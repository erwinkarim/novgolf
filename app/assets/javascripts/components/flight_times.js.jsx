var FlightTimeList = React.createClass({
  getInitialState: function(){
      return {times: this.props.times}
  },
  onClick: function(){
      console.log('close attempted');
  },
  render: function(){
    var random_id = this.props.randomId;
    return (
      <div className="card-block btn-toolbar">{this.props.times.map( (time, timeIndex) =>
        <div className="btn-group" key={timeIndex}>
          <input value={time} type="hidden" name={'flight_sch[' + random_id + '][times][]'} />
          <div className="btn btn-secondary">{time}</div>
          <div className="btn btn-secondary" onClick={this.props.deleteMe} value={timeIndex}>
            <i className="fa fa-close" value={timeIndex}></i>
          </div>
        </div>
      )}</div>
    );
  }
});

var FlightTimes = React.createClass({
  propTypes: {
    times: React.PropTypes.array
  },
  getInitialState: function(){
    return { text:'', times:this.props.times };
  },
  handleClick: function(e){
    //make sure that it's good
    if( /[0-2]?[0-9][:.][0-9]{2}/.test(e.target.value) ) {
      var newFlightTimes = this.state.times.concat(this.state.text).sort();
      this.setState({times:newFlightTimes, text:''});
    }
  },
  deleteMe: function(e){
    //ensure that there's at least 1 index left
    if(this.state.times.length == 1){
        return
    };

    console.log(e.target);
    console.log('value = ' + e.target.value);
    var timeIndex = parseInt(e.target.value, 10);
    this.setState(state => {
        state.times.splice(timeIndex,1);
        return {times: state.times};
    });
  },
  onChange: function(e){
    //check if the format is correct
    if( /[0-2]?[0-9][:.][0-9]{2}/.test(e.target.value) ) {
        this.refs.flightTimeInput.className = "input-group";
    } else {
        this.refs.flightTimeInput.className = "input-group has-danger";
    };
    return this.setState({text: e.target.value});
  },
  componentDidMount: function(){
    var handle = this;
    $(this.refs.textInput).timepicker({minTime:'6:00am', maxTime:'9:00pm', timeFormat:'H:i'}).on('change', function(e){
      //handle.setState({text:e.target.value})
      handle.onChange(e);
    });
  },
  render: function() {
    return (
      <div idName="flight-times">
        <div className="card">
          <FlightTimeList times={this.state.times} deleteMe={this.deleteMe} randomId={this.props.randomId} />
        </div>
        <div className="input-group" ref="flightTimeInput">
          <input typeName="text" className="form-control" onChange={this.onChange} ref="textInput" />
          <span className="input-group-addon" onClick={this.handleClick} value={this.state.text}>
            <i className="fa fa-plus"></i>
          </span>
        </div>
      </div>
    );
  }
});
