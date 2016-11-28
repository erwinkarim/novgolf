var defaultMembership = {
    id:0, user_id:0, name:randomID(), golf_club_id:0, expires:"2001-12-31"
};

var UserMembershipCard = React.createClass({
  propTypes: { current_user: React.PropTypes.object, memberships_path:React.PropTypes.string },
  getInitialState: function(){
    return {
      memberships:[]
    }
  },
  componentDidMount: function(){
    //should load the membership list here
    fetch(`${this.props.memberships_path}`).then( function(response){
      return response.json();
    }).then(function(json){
      console.log('json', json);
    });


  },
  newMembership: function(e){
    console.log("new membership");
    var newMemberships = this.state.memberships;
    newMemberships.push(defaultMembership);
    this.setState({memberships:newMemberships})
  },
  deleteMembership: function(e){
    console.log("delete membership");
    var newMemberships = this.state.memberships;
    newMemberships.splice(e.target.dataset.index, 1);
    this.setState({memberships:newMemberships});

  },
  updateMembership: function(e){
    console.log("update membership");
  },
  render: function() {
    var footer = this.props.current_user == null ?
      null : (
        <div className="card-footer">
          <a href="#membershipModal" data-toggle="modal">Edit Membership</a>
        </div>
      );

    return (
      <div className="card">
        <UserMembershipModal
          newMembership={this.newMembership} deleteMembership={this.deleteMembership} updateMembership={this.updateMembership}
          memberships={this.state.memberships} />
        <div className="card-header">Membership</div>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">None yet...</li>
        </ul>
        { footer }
      </div>
    );
  }
});

var UserMembershipModal = React.createClass({
  propTypes: {memberships:React.PropTypes.array },
  render: function(){
    return (
      <div ref="membershipModal" className="modal fade" id="membershipModal">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal"><span>&times;</span></button>
              <h4 className="modal-title">Membership</h4>
            </div>
            <div className="modal-body">
              <p>Something about membership here</p>
              <form className="container-fluid" action="/">
                <div className="form-group row">{ this.props.memberships.map( (e,i) => {
                      return (
                        <div key={i}>
                          <div className="col-md-8 col-sm-12 form-group">
                            <input type="text" defaultValue={e.club_name} placeholder="Club Name" className="form-control" />
                          </div>
                          <div className="col-md-2 col-sm-12 form-group">
                            <input type="text" defaultValue={e.expires}  placeholder="Expires" className="form-control" />
                          </div>
                          <div className="col-md-2 col-sm-12 form-group">
                            <button type="button" className="btn btn-danger" onClick={this.props.deleteMembership}
                              data-index={i} ><i className="fa fa-minus"></i></button>
                          </div>
                        </div>
                      );
                    })
                  }
                  <div className="col-sm-12">
                    <button type="button" className="btn btn-primary" onClick={this.props.newMembership}>
                      <i className="fa fa-plus"></i>
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
              <button style={ {marginLeft:"5px"}} type="button" className="btn btn-primary" data-dismiss="modal"
                onClick={this.props.updateMembership} data-dismiss="modal">Update Membership
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
})
