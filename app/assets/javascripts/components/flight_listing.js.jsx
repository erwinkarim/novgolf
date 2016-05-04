var FlightListing = React.createClass({
  propTypes: {
    flightDate: React.PropTypes.string
  },
  getInitialState: function(){
    return { flightDate:this.props.flightDate};
  },
  componentDidMount: function(){
    $(this.refs.flightDate).datepicker();
  },
  render: function() {
    return (
      <ul className="list-group list-group-flush">
        <li className="list-group-item">
          <input type="text" ref="flightDate" value={this.state.flightDate} />
        </li>
        <li className="list-group-item">
          <div className="btn-group" data-toggle="buttons">
            <label className="btn btn-secondary">
              <input type="checkbox" autoComplete="off" /> 9.00am
            </label>
            <label className="btn btn-secondary">
              <input type="checkbox" autoComplete="off" /> 9.30am
            </label>
            <label className="btn btn-secondary">
              <input type="checkbox" autoComplete="off" /> 10.00am
            </label>
          </div>
        </li>
      </ul>
    );
  }
});
