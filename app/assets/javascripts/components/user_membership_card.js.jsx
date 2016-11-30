var defaultMembership = {
  id:undefined, alt_club_name:undefined, club_name:undefined, golf_club_id:undefined,
//    input date only accept YYYY-MM-DD format
//    expires_at: (new Date(Date.now() + 60*60*24*365*1000).toLocaleDateString() )
  expires_at: "2017-12-31"
};

var UserMembershipCard = React.createClass({
  propTypes: {
    memberships_path:React.PropTypes.string, allowEdit:React.PropTypes.bool, csrfToken:React.PropTypes.string },
  getDefaultProps: function(){
    return {allowEdit:false};
  },
  getInitialState: function(){
    return {
      memberships:[]
    }
  },
  componentDidMount: function(){
    //should load the membership list here
    handle = this;
    fetch(this.props.memberships_path).then( function(response){
      return response.json();
    }).then(function(json){
      handle.setState({memberships:json});
    });
  },
  updateMembership: function(newMemberships){
    this.setState({memberships:newMemberships.slice(0)});
  },
  render: function() {
    //show modal if allow to edit
    var membershipModal = (this.props.allowEdit) ? (
      <UserMembershipModal csrfToken={this.props.csrfToken} memberships={this.state.memberships}
        memberships_path={this.props.memberships_path} updateMembership={this.updateMembership} />
    ) : null;
    var footer = (this.props.allowEdit) ?
      (
        <div className="card-footer">
          <a href="#membershipModal" data-toggle="modal">Edit Membership</a>
        </div>
      ) : null ;

    var membershipList = this.state.memberships.length == 0 ?  (
      <ul className="list-group list-group-flush">
        <li className="list-group-item">None yet...</li>
      </ul>
    ) : (
      <ul className="list-group list-group-flush">{ this.state.memberships.map( (e,i) => {
        return (<li key={i} className="list-group-item">{e.club_name}</li> )
      })}</ul>
    )
    return (
      <div className="card">
        { membershipModal }
        <div className="card-header">Membership</div>
        { membershipList}
        { footer }
      </div>
    );
  }
});

var UserMembershipModal = React.createClass({
  propTypes: {memberships:React.PropTypes.array, csrfToken:React.PropTypes.string },
  getInitialState: function(){
    //clone the array
    var newMemberships = JSON.parse( JSON.stringify(this.props.memberships) )
    return {memberships:newMemberships};
  },
  componentDidMount: function(){
    //setup datepicker for each date field
  },
  componentWillReceiveProps: function(nextProps){
    this.setState({memberships:nextProps.memberships});
  },
  sendUpdates:function(){
    //send forms and if successful, update parent about memberships list change
    var form = document.querySelector('#membership-form');
    var handle = this;
    fetch(this.props.memberships_path, {
      credentials: 'same-origin',
      method:'POST',
      body: new FormData(form)
    }).then( function(response){
      return response.json();
    }).then( function(json){
      //send updates to the mothership
      handle.props.updateMembership(handle.state.memberships);
    });
  },
  newMembership: function(e){
    var newMemberships = this.state.memberships;
    newMemberships.push( Object.assign({}, defaultMembership) );

    this.setState((prevState) => ({
      memberships: newMemberships
    }))
  },
  updateMembership: function(e){
    //var newMemberships = this.state.memberships.slice(0);
    var newMemberships = JSON.parse( JSON.stringify(this.state.memberships) )
    newMemberships[e.target.dataset.index][`${e.target.dataset.value}`] = e.target.value;

    this.setState( (prevState) => ( {memberships:newMemberships}));
  },
  deleteMembership: function(e){
    var newMemberships = this.state.memberships;
    newMemberships.splice(e.target.dataset.index, 1);
    this.setState({memberships:newMemberships});
  },
  resetForm: function(){
    var newMemberships = this.props.memberships.slice(0);
    this.setState({memberships:newMemberships});
    $(this.refs.membershipModal).modal('hide');
  },
  render: function(){
    return (
      <div ref="membershipModal" className="modal fade" id="membershipModal" data-keyboard="false" data-backdrop="static">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" onClick={this.resetForm}><span>&times;</span></button>
              <h4 className="modal-title">Membership</h4>
            </div>
            <div className="modal-body">
              <p>Membership Details</p>
              <form className="container-fluid" method="post" id="membership-form" ref="membershipsForm" action={this.props.memberships_path}>
                <input type="hidden" name="authenticity_token" value={this.props.csrfToken} />
                <div className="form-group row">
                  { this.state.memberships.map( (e,i) => {
                    var random_id = randomID();
                    return (
                      <div key={i}>
                        <input type="hidden" defaultValue={e.golf_club_id} name={`memberships[${random_id}][golf_club_id]`} />
                        <input type="hidden" defaultValue={e.id} name={`memberships[${random_id}][id]`} />
                        <div className="col-md-7 col-sm-12 form-group">
                          <input type="text" value={e.club_name} onChange={this.updateMembership}
                            name={`memberships[${random_id}][club_name]`}
                            placeholder="Club Name" data-index={i} data-value="club_name" className="form-control" />
                        </div>
                        <div className="col-md-3 col-sm-12 form-group">
                          <input type="date" value={e.expires_at} onChange={this.updateMembership}
                            name={`memberships[${random_id}][expires_at]`}
                            placeholder="Expires" data-index={i} data-value="expires_at" className="form-control expires_date_field" />
                        </div>
                        <div className="col-md-2 col-sm-12 form-group">
                          <button type="button" className="btn btn-danger" onClick={this.deleteMembership}
                            data-index={i} ><i className="fa fa-minus"></i></button>
                        </div>
                      </div>
                      );
                    })
                  }
                  <div className="col-sm-12">
                    <button type="button" className="btn btn-primary" onClick={this.newMembership}>
                      <i className="fa fa-plus"></i>
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={this.resetForm}>Cancel</button>
              <button style={ {marginLeft:"5px"}} type="button" className="btn btn-primary" data-dismiss="modal"
                onClick={this.sendUpdates} data-dismiss="modal">Update Membership
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
})
