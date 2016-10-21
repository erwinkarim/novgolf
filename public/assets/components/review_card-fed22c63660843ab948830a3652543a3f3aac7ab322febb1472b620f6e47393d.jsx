var FormattedText = window.formattedText;

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
        obj_image = this.props.review.topic.image == null ? 'http://placehold.it/64x64' : this.props.review.topic.image;
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
      obj_image = this.props.review.user.image == null ? '/images/users/default.jpg' : this.props.review.user.image;
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
              <FormattedText>{this.props.review.comment}</FormattedText>
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
    reviews_path: React.PropTypes.string,
    showHeader: React.PropTypes.bool,
    linkHeader: React.PropTypes.bool,
    displayMode: React.PropTypes.oneOf(['reviewer', 'reviewee'])
  },
  getDefaultProps: function(){
    return { showHeader:false , linkHeader:true, displayMode:'reviewee'};
  },
  getInitialState: function(){
    return { reviews:[], offset:0, showLoadMoreReviews:true }
  },
  componentDidMount: function(){
    var handle = this;
    $.getJSON( this.props.reviews_path, null, function(data){
          handle.setState({ reviews:data, offset:data.length, showLoadMoreReviews:(data.length != 0)});
    })
  },
  loadMoreReviews: function(e){
    var handle = this;
    $.ajax({
      dataType:"json",
      data: {offset:this.state.offset},
      url: this.props.reviews_path,
      success: function(data){
        var newReviews = handle.state.reviews.concat(data);
        handle.setState({reviews:newReviews, offset:newReviews.length, showLoadMoreReviews:(data.length != 0)});
        $(handle.refs.loadMoreBtn).html( 'Load More Reviews' );
        $(handle.refs.loadMoreBtn).prop('disabled', false);
      },
      beforeSend: function(){
        $(handle.refs.loadMoreBtn).html( '<i class="fa fa-cog fa-spin"></i> Load More Reviews' );
        $(handle.refs.loadMoreBtn).prop('disabled', true);
      }

    });
  },
  render: function(){
    var header = this.props.showHeader ?
      <div className="card-header">
        {this.props.linkHeader ?
          <a href={this.props.reviews_path}>Recent Reviews</a> :
          "Recent Reviews"
        }
      </div> :
      "";
    var review_list = this.state.reviews.length == 0 ?
      <li className="list-group-item">No Reviews Yet</li>
    :
      this.state.reviews.map( (review,i) => <ReviewCard key={i} review={review} displayMode={this.props.displayMode} />)
    var loadMoreReviews = this.state.showLoadMoreReviews ?
      <li className="list-group-item">
        <button className="btn btn-link" ref="loadMoreBtn" type="button" onClick={this.loadMoreReviews} data-offset={this.state.offset}>
          Load More Reviews
        </button>
      </li>
    :
      ""

    return (
      <div className="card">
        { header }
        <ul className="list-group list-group-flush">
          { review_list }
          { loadMoreReviews }
        </ul>
      </div>
    );
  }
})
