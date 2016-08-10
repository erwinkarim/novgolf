var ReviewCard = React.createClass({
  propTypes:{
      review:React.PropTypes.object
  },
  render: function() {
    var obj_name = null;
    var obj_date = null;
    var obj_link = '#';
    var obj_image = 'http://placehold.it/400x400';

    //setup the obj_name / obj_date
    //need to find a cleaner way to set things up
    if(this.props.displayMode === "reviewer"){
      if(this.props.review.topic_type == "UserReservation"){
        obj_name = this.props.review.topic.golf_club.name;
        obj_date = this.props.review.topic.booking_datetime;
        obj_link = this.props.review.topic.link;
        obj_image = this.props.review.topic.image;
      } else {
        obj_name = this.props.review.topic_type + "#" + this.props.review.topic_id;
        obj_date = this.props.review.topic.created_at;
      }
    } else {
      //display mode is reviewee
      if(this.props.review.topic_type == "UserReservation"){
        obj_date = this.props.review.topic.booking_datetime;
      } else {
        obj_date = this.props.review.created_at;
      }
      obj_name = this.props.review.user.name;
      obj_link = this.props.review.user.link;
      obj_image = this.props.review.user.image;
    };

    return (
        <li className="list-group-item">
          <div className="row">
            <div className="col-xs-3 col-md-2">
              <a href={obj_link}> <img className="img-circle" src={obj_image} height="64" /> </a>
            </div>
            <div className="col-xs-9 col-md-10">
              <h4><a href={obj_link}>{obj_name}</a> ({obj_date})</h4>
              <div>{ arrayFromRange(1,this.props.review.rating).map( (e,i) =>
                <i key={i} className="fa fa-star"></i>
              )}</div>
            </div>
          </div>
          <div className="row card-text">
            <div className="col-xs-12">
              <p className="card-text">{this.props.review.comment}</p>
              <small>Posted at {this.props.review.created_at}</small>
            </div>
          </div>
        </li>
    );
  }
});

//to be used in conjuction with a card class
var ReviewList = React.createClass({
  propTypes:{
    reviews:React.PropTypes.array,
    showHeader: React.PropTypes.bool,
    displayMode: React.PropTypes.oneOf(['reviewer', 'reviewee'])
  },
  getDefaultProps: function(){
    return { showHeader:false , displayMode:'reviewee'};
  },
  render: function(){
    var header = this.props.showHeader ? (<li className="list-group-item"><h3>Recent Reviews</h3></li>) : "";
    return (
      <div className="card">
        <ul className="list-group list-group-flush">
          { header }
          {this.props.reviews.map( (review,i) =>
            <ReviewCard key={i} review={review} displayMode={this.props.displayMode} />
          )}
        </ul>
      </div>
    );
  }
})
