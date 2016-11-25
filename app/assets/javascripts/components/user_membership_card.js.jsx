var UserMembershipCard = React.createClass({
  propTypes: {membershipList: React.PropTypes.array},
  getDefaultProps: function(){
    return {membershipList:[]}
  },
  getInitialState: function(){
    return {
      membershipList:this.props.membershipList
    }
  },
  updateMembership: function(e){
    console.log("update membership");
  },
  render: function() {
    return (
      <div className="card">
        <UserMembershipModal updateMembership={this.updateMembership} membershipList={this.state.membershipList}/>
        <div className="card-header">Membership</div>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">None yet...</li>
        </ul>
        <div className="card-footer">
          <a href="#membershipModal" data-toggle="modal">Edit Membership</a>
        </div>
      </div>
    );
  }
});

var UserMembershipModal = React.createClass({
  propTypes: {membershipList:React.PropTypes.array },
  render: function(){
    return (
      <div ref="membershipModal" className="modal fade" id="membershipModal">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal"><span>&times;</span></button>
              <h4 className="modal-title">Membership</h4>
            </div>
            <div className="modal-body">
              <p>Something about membership here</p>
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
