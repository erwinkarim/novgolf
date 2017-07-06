
var GolfClubMgmtCard = React.createClass({
  propTypes: {
      club:React.PropTypes.object
  },
  getDefaultProps: ()=>{
    return {
      club:{name:'', id:''}
    }
  },
  componentWillMount: function(){
    this.setState({ random_id:randomID()});
  },
  render: function(){
    let tabs = ["summary", "photos", "courses", "flights"];

    return (
      <li className="list-group-item">
        <div className="w-100 cursor-pointer d-flex justify-content-start">
          <div className="align-self-center">
            <button className="btn btn-link" data-target={`#club-${this.state.random_id}`} data-toggle="collapse">
              { this.props.club.name }
            </button>
          </div>
          <div className="align-self-center ml-auto">
            <a href={`/admin/golf_clubs/${this.props.club.id}/dashboard`} className="btn btn-primary">
            <i className="fa fa-dashboard"></i> Dashboard
            </a>
          </div>
        </div>
        <div className="collapse w-100 mt-2" id={`club-${this.state.random_id}`}>
          <ul className="nav nav-pills"> {
            tabs.map( (e,i) => {
              return (
                <li className={`nav-link ${i==0 ? "active" : ""}`} key={i} data-target={`#club-${this.state.random_id}-${e}`} data-toggle="tab">{e}</li>
              )
            })
          } </ul>
          <div className="tab-content mt-2">{
              tabs.map( (e,i) => {
                return (
                  <div className={`tab-pane ${i==0 ? "active" : ""}`} key={i} id={`club-${this.state.random_id}-${e}`}>
                    //render the propoer components here
                    {`${e} tab content here`}
                  </div>
                )
              })
          }</div>
        </div>

      </li>
    )
  }

});

var GolfClubManagement = React.createClass({
  getInitialState: () => {
      return { clubs:[]}
  },
  componentDidMount: function(){
    handle = this;

    //load the clubs
    fetch('/admin/golf_clubs.json', {
      credentials:'same-origin'
    }).then((respond)=> {
      return respond.json();
    }).then((json) => {
      handle.setState({clubs:json});
    })
  },
  render: function(){
    var handle = this;

    if(this.state.clubs.length == 0){
      return (
        <div className="card">
          <div className="card-block">No clubs yet...</div>
        </div>
      )
    };

    return (
      <div className="card">
        <ul className="list-group list-group-flushed">
          { handle.state.clubs.map( (club,club_index) => {
            return (
              <GolfClubMgmtCard club={club} key={club_index} />
            )
          })}
        </ul>
      </div>
    );
  }
})
