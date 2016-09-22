var LineItemListings = React.createClass({
  propTypes:{
    charge_schedules_path: React.PropTypes.string
  },
  getInitialState: function(){
      return {charge_schedules:[]}
  },
  componentWillMount: function(){
    var handle = this;
    $.getJSON(this.props.charge_schedules_path, null, function(data){
        handle.setState({charge_schedules:data.charge_Schedules});
    })
  },
  render: function(){
    return (
      <div>
        <ul className="nav nav-tabs">{ this.state.charge_schedules.map( (e,i) =>
          <li className="nav-item" key={i}>
            <a href={`#charge-schedule-${e.id}`} data-toggle="tab" role="tab" className={`nav-link ${i==0 ? "active" : ""}`}>{e.id}</a>
          </li>
        )}</ul>
        <div className="tab-content">{ this.state.charge_schedules.map( (e,i) =>
          <div className={`tab-pane ${i==0 ? "active" : ""}`} key={i} id={`charge-schedule-${e.id}`}>Content for {e.id}</div>
        )}</div>
      </div>
    );
  }
});

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
            Each Charge Schedule has it's own line items
          </label>
        </div>
      </div>
    );
  }
});

var GlobalTaxSetting = React.createClass({
  propTypes: {
      admin_golf_club_path: React.PropTypes.string
  },
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
    paths:React.PropTypes.object,
    charge_schedules: React.PropTypes.array
  },
  render: function() {
    return (
      <ul className="list-group">
        <li className="list-group-item">
          <GlobalTaxSetting admin_golf_club_path={this.props.paths.admin_golf_club_path} />
        </li>
        <li className="list-group-item">
          <LineItemSetting />
        </li>
        <li className="list-group-item">
          <LineItemListings charge_schedules_path={this.props.paths.charge_schedules_path} />
        </li>
      </ul>
    );
  }
});
