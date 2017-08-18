var React = require('react');
var ReviewCard = require('./ReviewCard')

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
      <div className="card mb-2">
        { header }
        <ul className="list-group list-group-flush">
          { review_list }
          { loadMoreReviews }
        </ul>
      </div>
    );
  }
})

module.exports = ReviewList;
