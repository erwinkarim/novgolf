var ReviewCard = React.createClass({
  propTypes:{
      review:React.PropTypes.object
  },
  render: function() {
    return (
        <li className="list-group-item">
          <div className="row">
            <div className="col-xs-3 col-md-2"> <img className="img-circle" src={this.props.review.user.image} height="64" /> </div>
            <div className="col-xs-9 col-md-10">
              <h4>{this.props.review.created_at}</h4>
              <div>{ arrayFromRange(1,this.props.review.rating).map( (e,i) =>
                <i className="fa fa-star"></i>
              )}</div>
            </div>
          </div>
          <div className="row card-text">
            <div className="col-xs-12">
              <p className="card-text">{this.props.review.comment}</p>
            </div>
          </div>
        </li>
    );
  }
});
