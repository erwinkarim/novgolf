var ReviewStarSelection = React.createClass({
  /*
    TODO: hover behaviour when trying to select stars
  */
  propTypes: {
    rating:React.PropTypes.number
  },
  getInitialState: function(){
    return {hoverRating:this.props.rating, rating:this.props.rating}
  },
  toggleHover: function(e){
    this.setState({hoverRating:e.target.value});
  },
  resetRating: function(){
    this.setState({hoverRating:this.state.rating});
  },
  updateRating: function(e){
    this.setState({rating:e.target.dataset.value, hoverRating:e.target.dataset.value});
  },
  render: function(){
    return (
      <li className="list-group-item">
        <div className="form-group">
          <label>Rating</label>
          <br />
          <div className="btn-group" data-toggle="buttons">
            { arrayFromRange(1,5).map( (e,i) => {
              var buttonIsActive = e == this.state.rating;
              var starState = e <= this.state.hoverRating ? "fa fa-star" : "fa fa-star-o";
              return (
                <label className={`btn btn-secondary ${buttonIsActive ? "active" : ""}`} data-value={e} onClick={this.updateRating}
                  key={i} onMouseEnter={this.toggleHover} onMouseLeave={this.resetRating}>
                  <input type="radio" name="review[rating]" id={`${e}star`} value={e}
                    checked={ e == this.state.rating } onChange={this.updateRating}/>
                  <i className={starState} onClick={this.updateRating} data-value={e}></i>
                </label>
              );
            }
          )}
          </div>
        </div>
      </li>
    );
  }
});

var ReviewFormMeat = React.createClass({
  propTypes:{
      review:React.PropTypes.object
  },
  render: function(){
    return (
      <li className="list-group-item">
        <div className="form-group">
          <label>Your Comments</label>
          <textarea name="review[comment]" className="form-control" rows="10" defaultValue={this.props.review.comment}
            placeholder="Your comments here. Not more than 320 characters"></textarea>
        </div>
      </li>

    );
  }
});

var ReviewForm = React.createClass({
  propTypes: {
    csrfToken: React.PropTypes.string,
    topic_type: React.PropTypes.string,
    topic_id: React.PropTypes.string,
    action: React.PropTypes.object,
    review: React.PropTypes.object

  },
  render: function() {
    return (
        <form method="post" action={this.props.action.path}>
          <input type="hidden" name="_method" value={this.props.action.method} />
          <input type="hidden" name="review[topic_type]" value={this.props.review.topic_type} />
          <input type="hidden" name="review[topic_id]" value={this.props.review.topic_id} />
          <input type="hidden" name="authenticity_token" value={this.props.crsfToken} />
          <div className="card">
            <ul className="list-group list-group-flush">
              <ReviewStarSelection rating={this.props.review.rating} />
              <ReviewFormMeat review={this.props.review}/>
              <li className="list-group-item">
                <button className="btn btn-primary" type="submit">Done!!!</button>
              </li>
            </ul>
          </div>
        </form>
    );
  }
});
