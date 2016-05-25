var QueryForm = React.createClass({
  propTypes: {
    csrfToken: React.PropTypes.string,
    queryTarget: React.PropTypes.string,
    queryString: React.PropTypes.string,
    queryDate: React.PropTypes.string,
    queryTime: React.PropTypes.string
  },
  handleChange: function(e){
  },
  componentDidMount: function(){
    $(this.refs.queryDate).datepicker({ minDate:0, dateFormat:'dd/mm/yy' });
    $(this.refs.queryTime).timepicker({ disableTextInput:'true', minTime:'6:00am', maxTime:'11:00pm', timeFormat:'H:i'});
  },
  render: function() {
    return (
      <form className="form-inline" method="get" action={this.props.queryTarget} key="query1">
        <input type="hidden" name="authenticity_token" value={this.props.crsfToken} />
        <div className="form-inline">
          <fieldset className="form-group">
            <label>I would like to play in</label>
            <input id="query" ref="query" name="q" className="form-control" type="text" placeholder="Golf Club" value={this.props.queryString} onChange={this.handleChange} />
          </fieldset>
            <label> on </label>
            <input id="flight-date" name="date" className="datepicker" ref="queryDate" type="text" className="form-control" placeholder="Date" value={this.props.queryDate} />
          <fieldset className="form-group">
            <label> @ </label>
            <input id="flight-time" name="time" ref="queryTime" className="form-control" type="text" placeholder="Golf Club" value={this.props.queryTime} />
          </fieldset>
          <button className="btn btn-primary" type="submit">Search
          </button>
        </div>
        <div style={ {color:'black'}}>
          <br />
          <div className="card col-md-4 col-xs-12">
            <ul className="list-group-flush list-group">
              <li className="list-group-item">I have <select name="pax" className="form-control">{ [2,3,4].map( (e,i) =>
                <option key={i}>{e}</option>)}</select> pax in my party
              </li>
            </ul>
          </div>
        </div>
      </form>
    );
  }
});
