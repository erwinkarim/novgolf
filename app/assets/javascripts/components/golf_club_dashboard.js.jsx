/*var GolfClubDashboard = React.createClass({
  propTypes: {
    club: React.PropTypes.object
  },
  componentDidMount: function(){
    console.log(this.props.club);
  },
  render: function() {
    return (
      <div>
        <p>GolfClub Dash Here</p>
      </div>
    );
  }
});

*/

var monthNames = ["January","February","March","April","May","June", "July","August","September","October","November","December"];

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getSunday(day) {
  var date = new Date(day);
  switch(day.getDay()) {
    case 0: return date;
    case 1: return addDays(date, 6);
    case 2: return addDays(date, 5);
    case 3: return addDays(date, 4);
    case 4: return addDays(date, 3);
    case 5: return addDays(date, 2);
    case 6: return addDays(date, 1);
    default: break;
  }
};

function getMonday(day) {
  var date = new Date(day);
  switch(day.getDay()) {
    case 0: return addDays(date, -6);
    case 1: return date;
    case 2: return addDays(date, -1);
    case 3: return addDays(date, -2);
    case 4: return addDays(date, -3);
    case 5: return addDays(date, -4);
    case 6: return addDays(date, -5);
    default: break;
  }
};

function getTuesday(day) {
  var date = new Date(day);
  switch(day.getDay()) {
    case 0: return addDays(date, -5);
    case 1: return addDays(date, 1);
    case 2: return date;
    case 3: return addDays(date, -1);
    case 4: return addDays(date, -2);
    case 5: return addDays(date, -3);
    case 6: return addDays(date, -4);
    default: break;
  }
};

function getWednesday(day) {
  var date = new Date(day);
  switch(day.getDay()) {
    case 0: return addDays(date, -4);
    case 1: return addDays(date, 2);
    case 2: return addDays(date, 1);
    case 3: return date;
    case 4: return addDays(date, -1);
    case 5: return addDays(date, -2);
    case 6: return addDays(date, -3);
    default: break;
  }
};

function getThursday(day) {
  var date = new Date(day);
  switch(day.getDay()) {
    case 0: return addDays(date, -3);
    case 1: return addDays(date, 3);
    case 2: return addDays(date, 2);
    case 3: return addDays(date, 1);
    case 4: return date;
    case 5: return addDays(date, -1);
    case 6: return addDays(date, -2);
    default: break;
  }
};

function getFriday(day) {
  var date = new Date(day);
  switch(day.getDay()) {
    case 0: return addDays(date, -2);
    case 1: return addDays(date, 4);
    case 2: return addDays(date, 3);
    case 3: return addDays(date, 2);
    case 4: return addDays(date, 1);
    case 5: return date;
    case 6: return addDays(date, -1);
    default: break;
  }
};

function getSaturday(day) {
  var date = new Date(day);
  switch(day.getDay()) {
    case 0: return addDays(date, -1);
    case 1: return addDays(date, 5);
    case 2: return addDays(date, 4);
    case 3: return addDays(date, 3);
    case 4: return addDays(date, 2);
    case 5: return addDays(date, 1);
    case 6: return date;
    default: break;
  }
}

var GolfClubDashboard = React.createClass({
  propTypes: {
    club: React.PropTypes.object,
    data: React.PropTypes.object,
    selectedDays: React.PropTypes.array,
    paths: React.PropTypes.object
  },
  getInitialState: function(){
    var monDate = new Date(getMonday(new Date()));
    var tuesDate = new Date(getTuesday(new Date()));
    var wednesDate = new Date(getWednesday(new Date()));
    var thursDate = new Date(getThursday(new Date()));
    var friDate = new Date(getFriday(new Date()));
    var saturDate = new Date(getSaturday(new Date()));
    var sunDate = new Date(getSunday(new Date()));
    return {
      selectedDays:[
        {"day":"Monday","date":monDate}, {"day":"Tuesday","date":tuesDate}, {"day":"Wednesday","date":wednesDate},
        {"day":"Thursday","date":thursDate}, {"day":"Friday","date":friDate}, {"day":"Saturday","date":saturDate}, {"day":"Sunday","date":sunDate}
      ],
        data: {flights:[]}
    };
  },
  componentDidMount: function(){
    console.log(this.props.club);
    var handle = this;
    $.getJSON(this.props.paths.club_path, null, function(data){
      handle.setState({data:data})
    });

    $(this.refs.queryDate).datepicker({dateFormat:'dd/mm/yy'});
  },
  handleChangeDate: function(){

    console.log("date changed!!");
  },
  render: function() {
    return (
      <div>
        <input type="text" name="date" ref="queryDate" onChange={this.handleChangeDate}/>
        <table className="table table-striped table-bordered table-responsive">
          <thead>
            <tr>
              <th></th>
              {this.state.data.flights.map((flight, i) =>
                <TableColumnHeadDashboard key = {i} data = {flight} />)}
            </tr>
          </thead>
          <tbody>
            {this.state.selectedDays.map((day, i) =>
              <TableRowDashboard key = {i} data = {this.state.data} selectedDay = {day} />)}
          </tbody>
        </table>
      </div>
    );
  },
});

var TableColumnHeadDashboard = React.createClass({
  render: function() {
    var myStyle = { textAlign:'center' }
    return (
      <th style={myStyle}> {this.props.data.tee_time} </th>
    );
  }
});

var TableRowDashboard = React.createClass({
  render: function() {
    var date = new Date(this.props.selectedDay.date);
    return (
      <tr>
        <TableRowHeadDashboard data={this.props.selectedDay.day + " - " + date.getDate() + " " + monthNames[date.getMonth()] + " " + date.getFullYear()} /> {this.props.data.flights.map((flight, i) =>
          <TableRowColumnDashboard key = {i} data = {flight} />)}
      </tr>
    );
  }
});

var TableRowHeadDashboard = React.createClass({
  render: function() {
    var myStyle = { textAlign:'center' }
    return (
      <th style={myStyle}> {this.props.data} </th>
    );
  }
});

var TableRowColumnDashboard = React.createClass({
  render: function() {
    var myStyle = { background:'#FFFFFF', padding:0 }
    if(this.props.data.reserve_status != null) {
      if(this.props.data.reserve_status == 0 || this.props.data.reserve_status == 1) {
        myStyle = { background:'#FFFF00', padding:0 }
      }
    else {
      myStyle = { background:'#FF0000', padding:0 } }
    }
    return (
      <td style={myStyle}><a data-trigger='focus' tabIndex='0' role ='button' />
      </td>
    );
  }
});
