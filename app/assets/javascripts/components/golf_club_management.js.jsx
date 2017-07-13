let defaultClub = {id:0, name:''};

var GolfClubTabSummary = React.createClass({
  propTypes: {
      componentId:React.PropTypes.string,
      club:React.PropTypes.object
  },
  getInitialState: ()=> {
    return {loaded:false, mapId:`map-${randomID()}`};
  },
  getDefaultProps: ()=>{
    return {club:defaultClub};
  },
  componentDidUpdate: function(prevProps, prevState){
    var handle = this;
    if(prevProps.club == null){
      //initialize the map
      var clubCoor = {lat:parseFloat(handle.props.club.lat), lng:parseFloat(handle.props.club.lng)};
      var initMap = () => {
        var newMap = new google.maps.Map(document.getElementById(handle.state.mapId), {
          center: clubCoor,
          zoom: 16,
          fullscreenControl:false,
          scrollWheel: false
        });

        var marker = new google.maps.Marker({
          position:clubCoor, map: newMap
        });

      }

      initMap();

    }
  },
  render: function(){
    //render basic if there's no info yet
    if(!this.props.loaded){
      return (<div className="card">
          <div className="card-block"><i className="fa fa-cog fa-spin"></i> Loading club .... </div>
      </div>);
    };

    var amenities_card = this.props.club.amenities.length == 0 ? (
      <div className="card"><div className="card-block">No amenities ... </div></div>
    ) : (
      <div className="card"><div className="card-block"><ul>{ this.props.club.amenities.map( (amenity, index) => {
          return (<li key={index}>{amenity.label}</li>)
        })
      }</ul></div></div>
    );

    return (<div>
      <div className="card">
        <div className="card-block pb-0">
          <h3> {this.props.club.name} </h3>
        </div>
        <div className="card-block">Operating Hours: {this.props.club.open_hour} - {this.props.club.close_hour}</div>
        <div className="card-block pt-0">
          { this.props.club.description.split("\n").map( (para, index) => {
            return (
              <p key={index}>{para}</p>
            )
          } )}
        </div>
      </div>
      <br />
      <div className="card">
        <div className="card-block">{this.props.club.address}</div>
        <div className="map" id={this.state.mapId} style={{ height:'30vh'}} ref={(map)=>{this.map=map;}}></div>
        <div className="card-block">Coordinates: {this.props.club.lat}, {this.props.club.lng}</div>
      </div>
      <br />
      { amenities_card }
      <br />
      <p>
        <a href={`/admin/golf_clubs/${this.props.club.id}`} className="btn btn-secondary mr-2">View Detail</a>
        <a href={`/admin/golf_clubs/${this.props.club.id}/edit`} className="btn btn-primary">Edit</a>
      </p>
    </div>)
  }
});

var GolfClubTabPhotos = React.createClass({
  propTypes: {
      photos:React.PropTypes.array,
      clubId:React.PropTypes.number
  },
  render: function(){
    if(this.props.photos == null || this.props.photos.length == 0){
      return (<div className="card">
        <div className="card-block">No Photos</div>
        <div className="card-block">
          <a className="btn btn-primary" href={`/admin/golf_clubs/${this.props.clubId}/photos`}>Edit Photo(s)</a>
        </div>
      </div>)
    };

    return (<div className="card">
      <div className="card-block row">{this.props.photos.map( (photo,index) => {
          return (
            <div className="col-3 pb-2 photo-card" key={index}>
              <img className="img-responsive" src={photo.square200} />
            </div>
          );
        })
      }</div>
      <div className="card-block">
        <a className="btn btn-primary" href={`/admin/golf_clubs/${this.props.clubId}/photos`}>Edit Photo(s)</a>
      </div>
    </div>)
  }
});

var GolfClubTabCourses = React.createClass({
  propTypes: {
    courses:React.PropTypes.array,
    clubId:React.PropTypes.number
  },
  render: function(){
    if(this.props.courses == null){
      return (
        <div className="card">
          <div className="card-block">No courses ...</div>
        </div>
      )
    };

    return (<div>
      {
        this.props.courses.map( (course,index) => {
          var random_id = randomID();
          return (
            <div className="card mb-2" key={index}>
              <div className="card-block">
                <a href={`#course-${random_id}`} data-toggle="collapse"> {course.name} ({course.course_status.desc}) </a>
              </div>
              <div className="collapse" id={`course-${random_id}`}>
                <div className="card-block">
                  Course management info here
                </div>
              </div>
            </div>
          );
        })
      }
      <a href={`/admin/golf_clubs/${this.props.clubId}/courses`} className="btn btn-primary">Edit Courses</a>
    </div>)
  }
});

var GolfClubTabFlights = React.createClass({
  propTypes: {
    flights:React.PropTypes.array,
    clubId:React.PropTypes.number
  },
  render: function(){
    if(this.props.flights == null){
      return(<div className="card">
        <div className="card-block">No flights detected ... </div>
      </div>)
    };

    return (<div>
      { this.props.flights.map( (flight, index) => {
          var random_id = randomID();
          var handle = this;

          return (
            <div className="card mb-2" key={index}>
              <div className="card-block">
                <a href={`#collapse-${random_id}`} data-toggle="collapse">
                  {flight.name} Schedule
                </a>
              </div>
              <div className="collapse" id={`collapse-${random_id}`} ref={(collapse)=> {this.collapse=collapse;}}>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    <h3>Settings</h3>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Min</th>
                          <th>Max</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Pax</td><td>{flight.min_pax}</td><td>{flight.max_pax}</td>
                          <td>{toCurrency(flight.charge_schedule.session_price)}</td>
                        </tr>
                        <tr>
                          <td>Buggy</td><td>{flight.min_cart}</td><td>{flight.max_cart}</td>
                          <td>{toCurrency(flight.charge_schedule.cart)}</td>
                        </tr>
                        <tr>
                          <td>Caddy</td><td>{flight.min_caddy}</td><td>{flight.max_caddy}</td>
                          <td>{toCurrency(flight.charge_schedule.caddy)}</td>
                        </tr>
                        <tr>
                          <td colSpan={3}>Insurance ({flight.charge_schedule.insurance_mode})</td>
                          <td>{toCurrency(flight.charge_schedule.insurance)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </li>
                  <li className="list-group-item">
                    <h3 className="w-100">Schedule</h3>
                    <h4 className="w-100">Days Active</h4>
                    <div className="btn-group w-100">{
                        arrayFromRange(1,7).map( (number,index) => {
                          day = number == 7 ? 0 : number;
                          active = (flight.flight_matrices == null) ? '' :
                            (flight.flight_matrices[0][`day${number}`] == 1 ? 'active' : '');
                          return (
                            <label  key={index} className={`btn btn-secondary ${active}`}>{ getDayOfWeek(day) }</label>
                          )
                        })
                      }
                    </div>
                    <h4 className="w-100">Time Active</h4>
                    <div className="w-100">{
                        flight.flight_matrices.map( (flight_m, index) => {
                          return (<div className="btn-group mr-2" key={index}>
                            <label className="btn btn-secondary">{ flight_m.tee_time}</label>
                            <label className="btn btn-info">{ flight_m.second_tee_time}</label>
                          </div>)
                        })
                      }
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )
        })
      }
      <a href={`/admin/golf_clubs/${this.props.clubId}/edit`} className="btn btn-primary">Edit Flights</a>
    </div>)
  }
});

var GolfClubMgmtCard = React.createClass({
  propTypes: {
      club:React.PropTypes.object
  },
  getDefaultProps: ()=>{ return { club:defaultClub }; },
  getInitialState:()=>{ return {club:null, loaded:false}; },
  loadClub:function(){
    var handle = this;

    if(this.props.club.id == 0){
      return;
    }

    //load the club info
    fetch(`/admin/golf_clubs/${handle.props.club.id}.json?detailed=true`, {
      credentials:'same-origin'
    }).then((response)=>{
      return response.json();
    }).then((json)=>{
      handle.setState({club:json.club, loaded:true});
    })

  },
  componentWillMount: function(){
    this.setState({ random_id:randomID()});
  },
  componentDidMount: function(){

    var handle = this;

    $(this.clubCollapse).on('show.bs.collapse', ()=>{
      if(!handle.state.loaded){
        handle.loadClub();
      }
    })
  },
  render: function(){
    let tabs = ["summary", "photos", "courses", "flights"];
    var handle = this;

    return (
      <li className="list-group-item">
        <div className="w-100 cursor-pointer d-flex justify-content-start">
          <div className="align-self-center">
            <button className="btn btn-link cursor-pointer"
              data-target={`#club-${this.state.random_id}`} data-toggle="collapse">
              { this.props.club.name }
            </button>
          </div>
          <div className="align-self-center ml-auto">
            <a href={`/admin/golf_clubs/${this.props.club.id}/dashboard`} className="btn btn-primary">
            <i className="fa fa-dashboard"></i> Dashboard
            </a>
          </div>
        </div>
        <div className="collapse w-100 mt-2" id={`club-${this.state.random_id}`} ref={(collapse)=>{this.clubCollapse=collapse;}} >
          <ul className="nav nav-pills"> {
            tabs.map( (e,i) => {
              return (
                <li className="nav-item" key={i}>
                  <a className={`nav-link cursor-pointer ${i==0 ? "active" : ""}`} key={i}
                    data-target={`#club-${this.state.random_id}-${e}`} data-toggle="tab">{toTitleCase(e)}</a>
                </li>
              )
            })
          } </ul>
          <div className="tab-content mt-2">{
              tabs.map( (e,i) => {
                var tabContent = null;
                var club_id = handle.state.club == null ? null : handle.state.club.id
                switch (e) {
                  case "photos":
                    var photos = handle.state.club == null ? null : handle.state.club.photos
                    tabContent = (<GolfClubTabPhotos loaded={handle.state.loaded} photos={photos} clubId={club_id}/>); break;
                  case "courses":
                    var courses = handle.state.club == null ? null : handle.state.club.course_listings;
                    tabContent = (<GolfClubTabCourses clubId={club_id} courses={courses} />);
                    break;
                  case "flights":
                    var flights = handle.state.club == null ? null : handle.state.club.flight_schedules;
                    tabContent = (<GolfClubTabFlights clubId={club_id} flights={flights} />);
                    break;
                  default: tabContent = (<GolfClubTabSummary loaded={handle.state.loaded} club={handle.state.club}/>);
                };

                return (
                  <div className={`tab-pane ${i==0 ? "active" : ""}`} ref={(tab)=>{this[`${e}Tab`]=tab;}} key={i} id={`club-${this.state.random_id}-${e}`}>
                    { tabContent }
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
