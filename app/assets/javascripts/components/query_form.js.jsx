var QueryForm = React.createClass({
  propTypes: {
    csrfToken: React.PropTypes.string,
    queryTarget: React.PropTypes.string,
    queryString: React.PropTypes.string,
    queryDate: React.PropTypes.string,
    queryTime: React.PropTypes.string
  },
  componentDidMount: function(){
    $(this.refs.queryDate).datepicker({ minDate:0, dateFormat:'dd/mm/yy' });
    $(this.refs.queryTime).timepicker({ disableTextInput:'true', minTime:'6:00am', maxTime:'11:00pm', timeFormat:'H:i'});
  },
  getInitialState: function(){
      return {
        queryString:this.props.queryString ,
        queryDate:this.props.queryDate,
        queryTime:this.props.queryTime
      }
  },
  handleChange: function(e){
    var newQueryString = e.target.value;
    return this.setState({queryString:newQueryString});
  },
  render: function() {
    return (
      <form className="form-inline" method="get" action={this.props.queryTarget} key="query1">
        <input type="hidden" name="authenticity_token" value={this.props.crsfToken} />
        <div className="form-inline">
          <fieldset className="form-group">
            <label>I would like to play in </label>
            <input id="query" ref="query" ref="q" name="q" className="form-control" type="text"
              placeholder="Golf Club" value={this.state.queryString} onChange={this.handleChange}/>
          </fieldset>
          <fieldset className="form-group">
            <label> on </label>
            <input id="flight-date" name="date" className="datepicker" ref="queryDate" type="text"
              className="form-control" placeholder="Date" value={this.state.queryDate} onChange={function(){}} />
          </fieldset>
          <fieldset className="form-group">
            <label> @ </label>
            <input id="flight-time" name="time" ref="queryTime" className="form-control" type="text"
              placeholder="Golf Club" value={this.state.queryTime} onChange={function(){}} />
          </fieldset>
          <button className="btn btn-primary" type="submit">Search</button>
        </div>
        <div style={ {color:'black'}}>
          <br />
          <div className="card col-md-4 col-xs-12">
            <ul className="list-group-flush list-group">
              <li className="list-group-item">I have <select name="pax" className="form-control">{ [2,3,4,5,6,7,8].map( (e,i) =>
                <option key={i}>{e}</option>)}</select> pax in my party
              </li>
            </ul>
          </div>
        </div>
      </form>
    );
  }
});
