var ReviewStarSelection = React.createClass({
  /*
    should handle how the star thing works
  */
  render: function(){
    return (
      <li className="list-group-item">
        <div className="form-group">
          <label>Rating</label>
          <br />
          <div className="btn-group" data-toggle="buttons">
            { arrayFromRange(1,5).map( (e,i) => {
              var buttonIsActive = e == this.props.rating;
              console.log(e, this.props.rating, e == this.props.rating);

              return (
                <label className={`btn btn-secondary ${buttonIsActive ? "active" : ""}`} key={i}>
                  <input type="radio" name="review[rating]" id={`${e}star`} value={e} defaultChecked={ e == this.props.rating }/><i className="fa fa-star"></i>
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
          <div className="card">
            <input type="hidden" name="_method" value={this.props.action.method} />
            <input type="hidden" name="review[topic_type]" value={this.props.review.topic_type} />
            <input type="hidden" name="review[topic_id]" value={this.props.review.topic_id} />
            <input type="hidden" name="authenticity_token" value={this.props.crsfToken} />
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
