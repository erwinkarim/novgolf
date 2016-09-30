var QueryForm = React.createClass({
  propTypes: {
    csrfToken: React.PropTypes.string,
    queryTarget: React.PropTypes.string,
    queryString: React.PropTypes.string,
    queryDate: React.PropTypes.string,
    queryTime: React.PropTypes.string,
    showSearchNav: React.PropTypes.bool,
    collapseSearchForm: React.PropTypes.bool,
    dropShadow: React.PropTypes.bool
  },
  getDefaultProps: function(){
      return {
        showSearchNav:false, collapseSearchForm:false, dropShadow:false
      }
  },
  componentDidMount: function(){
    $(this.refs.queryDate).datepicker({ minDate:0, dateFormat:'dd/mm/yy' });
    $(this.refs.queryTime).timepicker({ disableTextInput:'true', minTime:'6:00am', maxTime:'11:00pm', timeFormat:'H:i'});
  },
  getInitialState: function(){
      return {
        queryString:this.props.queryString ,
        queryDate:this.props.queryDate,
        queryTime:this.props.queryTime,
        showSearchNav:this.props.showSearchNav,
        collapseSearchForm:this.props.collapseSearchForm
      }
  },
  handleChange: function(e){
    var newQueryString = e.target.value;
    return this.setState({queryString:newQueryString});
  },
  render: function() {
    if (this.props.showSearchNav){
      var searchNav =
        <div>
          <nav className="navbar navbar-light bg-faded">
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#search-query-form">
              <i className="fa fa-search"></i>{ ` Searching ${this.props.queryString} on ${this.props.queryDate}@${this.props.queryTime}` }
            </button>
          </nav>
          <br />
        </div>
      ;
    };

    var collapseClass = this.props.collapseSearchForm ? "" : "in";
    var dropShadowClass = this.props.dropShadow ? "text-shadow" : "";

    return (
      <div>
        {searchNav}
        <div className="col-xs-12">
          <form id="search-query-form" className={"form-inline collapse" + collapseClass }  method="get" action={this.props.queryTarget} key="query1">
            <input type="hidden" name="authenticity_token" value={this.props.crsfToken} />
            <div className="form-inline">
              <div className="form-group">
                <label className={dropShadowClass}>I would like to play in </label>
                <span> </span>
                <input id="query" ref="query" ref="q" name="q" className="form-control" type="text"
                  placeholder="Golf Club" value={this.state.queryString} onChange={this.handleChange} />
              </div>
              <span> </span>
              <div className="form-group">
                <label className={dropShadowClass}> on </label>
                <span> </span>
                <input id="flight-date" name="date" className="datepicker" ref="queryDate" type="text"
                    className="form-control" placeholder="Date" value={this.state.queryDate} onChange={function(){}} />
              </div>
              <span> </span>
              <div className="form-group">
                <label className={dropShadowClass}> @ </label> <input id="flight-time" name="time" ref="queryTime" className="form-control" type="text"
                  placeholder="Golf Club" value={this.state.queryTime} onChange={function(){}} />
              </div>
              <span> </span>
              <button className="btn btn-primary" type="submit">Search</button>
            </div>
            <div style={ {color:'black'}}>
              <br />
              <div className="col-md-4 col-xs-12">
                <div className="card">
                  <div className="card-block">
                    I have <select name="pax" className="form-control">{ [2,3,4,5,6,7,8].map( (e,i) =>
                      <option key={i}>{e}</option>)}</select> balls in my flight(s)
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
});
