var ReviewStarSelection = React.createClass({
  /*
    should handle how the star thing works
  */
  render: function(){
    return (
      <li className="list-group-item"><div className="btn-group" data-toggle="buttons">
        { arrayFromRange(1,5).map( (e,i) =>
          <label className="btn btn-secondary" key={i}>
            <input type="radio" name="rating" id={`${e}star`} value={e} /><i className="fa fa-star"></i>
          </label>
        )}
      </div></li>
    );
  }
});

var ReviewFormMeat = React.createClass({
  render: function(){
    return (
      <li className="list-group-item">
        <div className="form-group">
          <label>Your Comments</label>
          <textarea className="form-control" rows="10" placeholder="Your comments here. Not more than 320 characters"></textarea>
        </div>
      </li>

    );
  }
});

var ReviewForm = React.createClass({
  propTypes: {
    csrfToken: React.PropTypes.string,
    topic_type: React.PropTypes.string,
    topic_id: React.PropTypes.number

  },
  render: function() {
    return (
        <div className="card">
          <form method="post" action="#">
            <ul className="list-group list-group-flush">
              <ReviewStarSelection />
              <ReviewFormMeat />
              <li className="list-group-item">
                <button className="btn btn-primary" type="button">Done!!!</button>
              </li>
            </ul>
          </form>
        </div>
    );
  }
});
