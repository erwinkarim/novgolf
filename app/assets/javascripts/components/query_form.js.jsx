var QueryForm = React.createClass({
  propTypes: {
    csrfToken: React.PropTypes.string,
    queryTarget: React.PropTypes.string,
    queryString: React.PropTypes.string,
    queryDate: React.PropTypes.string,
    queryTime: React.PropTypes.string,
    showSearchNav: React.PropTypes.bool,
    collapseSearchForm: React.PropTypes.bool,
    dropShadow: React.PropTypes.bool,
    queryPax: React.PropTypes.number
  },
  getDefaultProps: function(){
      return {
        showSearchNav:false, collapseSearchForm:false, dropShadow:false, queryPax:2
      }
  },
  componentDidMount: function(){
    $(this.refs.queryDate).datepicker({ minDate:0, dateFormat:'dd/mm/yy' });
    $(this.refs.queryTime).timepicker({ disableTextInput:'true', minTime:'6:00am', maxTime:'7:00pm', timeFormat:'H:i'});

    var countries = [
      { value: 'Andorra', data: 'AD' },
      { value: 'Singapore', data: 'SG' },
      { value: 'Malaysia', data: 'MY' },
      { value: 'Zimbabwe', data: 'ZZ' }
    ];

    $(this.refs.query).autocomplete({
      serviceUrl: '/suggest',
      dataType:'json',
      deferRequestBy:100,
      paramName:'q'
    });
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
      var toggleStyle = {backgroundImage:'none', width:'100%', 'border':'none'};
      var searchNav =
        <nav className="navbar navbar-light bg-faded">
          <button className="btn border-0 btn-block navbar-toggler" type="button" data-toggle="collapse" data-target="#search-query-form">
            <i className="fa fa-search"></i> Refine Search
          </button>
        </nav>
      ;
    };

    var collapseClass = this.props.collapseSearchForm ? "" : "in";
    var dropShadowClass = this.props.dropShadow ? "text-shadow" : "";

    return (
      <div>
        {searchNav}
        <div className="font-special">
          <form id="search-query-form" className={"collapse" + collapseClass }  method="get" action={this.props.queryTarget} key="query1">
            <input type="hidden" name="authenticity_token" value={this.props.crsfToken} />
            <div className="col-12">
              <br />
              <div className="form-group row">
                <div className="col-12 col-md-6">
                  <input id="query" ref="query" id="q" name="q" className="mb-1 form-control" type="text"
                    placeholder="Golf Course" value={this.state.queryString} onChange={this.handleChange} />
                </div>
                <div className="col-12 col-md-3">
                  <input id="flight-date" name="date" className="datepicker" ref="queryDate" type="text"
                      className="mb-1 form-control" placeholder="Date" value={this.state.queryDate} onChange={function(){}} />
                </div>
                <div className="col-12 col-md-3">
                  <input id="flight-time" name="time" ref="queryTime" className="form-control" type="text"
                    placeholder="Golf Club" value={this.state.queryTime} onChange={function(){}} />
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="text-center hidden-md-up"><button className="btn btn-primary" type="submit">Search</button></div>
              <div className="hidden-sm-down"><br /><button className="btn btn-primary" type="submit">Search</button></div>
            </div>
            <div className="col-12 col-md-6">
              <br />
              <div className="card">
                <div className="card-block">
                  I have <select name="pax" className="form-control" defaultValue={this.props.queryPax}>{ [2,3,4,5,6,7,8].map( (e,i) =>
                    <option key={i}>{e}</option>)}</select> balls in my game(s)
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
});
