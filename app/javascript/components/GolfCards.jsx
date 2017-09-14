var React = require("react");
var GolfReserveForm = require('./GolfReserveForm');

let FLIGHT_INFO_DEFAULTS = {
      pax:0, member:0, buggy:0, caddy:0, insurance:0, tax:0.00, totalPrice:0.00, members:[], reserved_by:null,
      ur_contact:null, reserve_method:0,
      reservation_id:null, first_course_id:null, second_course_id:null
};

let UR_CONTACT_DEFAULTS = {
  id:"", contact_type:"UrContact", name:"", email:"", telephone:""
};

var golfCardDefaultOptions = {
    GolfClubTimesShowPrices:true,
    displayCourseGroup:false
};

/*
  TODO:
  * change the click button to show up the club, to a collapse toggle to show
    the form + link to club details
  * consider to chang the wording to link to club details
  * presentation mode: exact or fuzzy
      exact: show exact flight tee times
      fuzzy: show general session, to be completed by turks

      how things should be shown:-
      exact:-
        when click, first show tee time selection
        when tee time selected, show the flight configuration
        able to select multiple flights
      fuzzy:
        when click,
          straight away show the flight configuration
        only 1 flight can be configured at a time
*/
var GolfCards = React.createClass({
  propTypes: {
    crsfToken: React.PropTypes.string,
    club: React.PropTypes.object,
    paths: React.PropTypes.object,
    queryData: React.PropTypes.object,
    flights: React.PropTypes.array,
    options: React.PropTypes.object,
    selectionMode: React.PropTypes.oneOf(['fuzzy', 'exact'])
  },
  getDefaultProps:function(){
      return {options: golfCardDefaultOptions, selectionMode:'fuzzy' }
  },
  getInitialState: function(){
      return { teeTimes:[], totalPrice: 0, random_id:randomID() }
  },
  componentDidMount: function(){
      //console.log(this.props);
      $(this.refs.reserveBtnLi).hide();
  },
  render: function() {
    //either get generic or scheduled image
    var photoPath, hasCarousel;
    if(this.props.club.photos.length == 0) {
      photoPath = this.props.paths.img;
      hasCarousel = false;
    }else {
      photoPath = this.props.club.photos[0];
      hasCarousel = true;
    };

    var carouselDiv = (
      <div className="carousel" data-ride="carousel" id={`carousel-${this.state.random_id}`}>
        <ol className="carousel-indicators">
          <li data-target={`#carousel-${this.state.random_id}`} data-slide-to="0" className="active"></li>
          <li data-target={`#carousel-${this.state.random_id}`} data-slide-to="1"></li>
          <li data-target={`#carousel-${this.state.random_id}`} data-slide-to="2"></li>
        </ol>
        <div className="carousel-inner" role="listbox">{
          this.props.club.photos.map( (e,i) => (
              <div key={i} className={`carousel-item ${i==0 ? "active" : ""}`} >
                <img className="img-responsive card-img-top" src={e} />
              </div>
          ))
        }</div>
      </div>
    );

    return (
      <div className="card d-inline-block">
        { hasCarousel ? (carouselDiv) : (<img className="img-responsive card-img-top" src={photoPath} />) }
        <a href={`#collapse-${this.props.club.id}`} data-toggle="collapse">
          <div className="card-img-overlay">
            <h4 className="text-white card-title text-shadow">{ toCurrency(Math.min.apply(null, this.props.flights.map( (e,i) => parseFloat(e.prices.flight))) )}</h4>
            <h4 className="text-white card-title text-shadow">{this.props.club.name}</h4>
          </div>
        </a>
        <div className="collapse" id={`collapse-${this.props.club.id}`}>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              <a href={this.props.paths.club} className="btn btn-info" target="_blank">Details</a>
            </li>
            <GolfReserveForm crsfToken={this.props.crsfToken} reserveTarget={this.props.paths.reserve}
              club={this.props.club} flights={this.props.flights} queryData={this.props.queryData}
              insurance_modes={this.props.insurance_modes} options={this.props.options}  selectionMode={this.props.selectionMode} />
          </ul>
        </div>
        <ul className="list-group-flush list-group">
        </ul>
      </div>
    );
  }
});

module.exports = GolfCards
