var GolfClubDashboard = React.createClass({
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
