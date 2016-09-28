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
          </div>
        </li>
      </ul>
    );
  }
});
