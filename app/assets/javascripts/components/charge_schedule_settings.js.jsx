var LineItemSetting = React.createClass({
  render: function(){
    return (
      <div className="form-group">
        <h3>Line Item Settings</h3>
        <legend>Line Item Global Settings</legend>
        <div className="form-check">
          <label className="form-check-label">
            <input type="radio" name="globalLineItemMode" defaultChecked={true} />
            Use the same line item for all charge schedule
          </label>
        </div>
        <div className="form-check">
          <label className="form-check-label">
            <input type="radio" name="globalLineItemMode" />
            Each Charge Schedule has it's onw line items
          </label>
        </div>
      </div>
    );
  }
});

var GlobalTaxSetting = React.createClass({
  getInitialState: function(){
    return {tax_schedules:[], selected:0};
  },
  componentDidMount: function(){
    var handle=this;
    $.getJSON(this.props.admin_golf_club_path + "/tax_schedule", null, function(data){
        handle.setState({ tax_schedules:data.tax_schedules, selected:data.selected})
    });
  },
  render: function(){
    return (
      <div className="form-group">
        <h3>Global Tax Settings</h3>
        <label>Country</label>
        <select className="form-controls">{ this.state.tax_schedules.map( (e,i) =>
          <option key={i} value={e.id}>{e.country}</option>
        )}
        </select>
      </div>
    );
  }
});

var ChargeScheduleSettings = React.createClass({
  propTypes: {
      admin_golf_club_path: React.PropTypes.string
  },
  render: function() {
    return (
      <ul className="list-group">
        <li className="list-group-item">
          <GlobalTaxSetting admin_golf_club_path={this.props.admin_golf_club_path} />
        </li>
        <li className="list-group-item">
          <LineItemSetting />
        </li>
        <li className="list-group-item">
          List of list items here and it's appropiate charges
        </li>
      </ul>
    );
  }
});
