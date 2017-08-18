var React = require('react');

var ReviewCard = React.createClass({
  propTypes:{
      review:React.PropTypes.object
  },
  render: function() {
    var obj_name = null;
    var obj_date = null;
    var obj_link = '#';
    var obj_image = 'https://placehold.it/400x400';

    //setup the obj_name / obj_date
    //need to find a cleaner way to set things up
    if(this.props.displayMode === "reviewer"){
      if(this.props.review.topic_type == "UserReservation"){
        obj_name = this.props.review.topic.golf_club.name;
        obj_date = this.props.review.topic.booking_datetime;
        obj_link = this.props.review.topic.link;
        obj_image = this.props.review.topic.image == null ? 'https://placehold.it/64x64' : this.props.review.topic.image;
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
      obj_image = this.props.review.user.image_path == null ? '/images/users/default.jpg' : this.props.review.user.image_path;
    };

    return (
        <li className="list-group-item">
          <div className="row w-100">
            <div className="col-3 col-md-2">
              <a href={obj_link}> <img className="rounded-circle" src={obj_image} width="64" height="64" /> </a>
            </div>
            <div className="col-9 col-md-10">
              <h4><a href={obj_link}>{obj_name}</a> ({obj_date})</h4>
              <div>{ arrayFromRange(1,this.props.review.rating).map( (e,i) =>
                <i key={i} className="fa fa-star"></i>
              )}</div>
            </div>
          </div>
          <div className="row w-100 card-text">
            <div className="col-12">
              <div className="text-wp-pre-line">{this.props.review.comment}</div>
              <small>Posted at {this.props.review.created_at}</small>
            </div>
          </div>
        </li>
    );
  }
});

module.exports = ReviewCard;
