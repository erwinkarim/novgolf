var React = require('react');

var defaultMembership = {
  id:undefined, alt_club_name:undefined, club_name:undefined, golf_club_id:undefined,
//    input date only accept YYYY-MM-DD format
//    expires_at: (new Date(Date.now() + 60*60*24*365*1000).toLocaleDateString() )
  expires_at: "2017-12-31"
};

var UserMembershipCard = React.createClass({
  propTypes: {
    memberships_path:React.PropTypes.string,
    club_path: React.PropTypes.string,
    allowEdit:React.PropTypes.bool, csrfToken:React.PropTypes.string },
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
    var handle = this;
    var membershipModal = (this.props.allowEdit) ? (
      <UserMembershipModal csrfToken={this.props.csrfToken} memberships={this.state.memberships}
        memberships_path={this.props.memberships_path} updateMembership={this.updateMembership} />
    ) : null;
    var footer = (this.props.allowEdit) ?
      (
        <div className="card-footer">
          <a href="#membershipModal" data-toggle="modal">Edit Memberships</a>
        </div>
      ) : null ;

    var membershipList = this.state.memberships.length == 0 ?  (
      <ul className="list-group list-group-flush">
        <li className="list-group-item">None yet...</li>
      </ul>
    ) : (
      <ul className="list-group list-group-flush">{ this.state.memberships.map( (e,i) => {
        var club_listing = e.golf_club_id == null ? (<li key={i} className="list-group-item">{e.club_name}</li>) : (
          <li key={i} className="list-group-item"><a href={`${this.props.club_path}/${e.golf_club_id}`}>{e.club_name}</a></li>
        );

        return (club_listing);
      })}</ul>
    )
    return (
      <div className="card mb-2">
        { membershipModal }
        <div className="card-header">Memberships</div>
        { membershipList}
        { footer }
      </div>
    );
  }
});

var AutoCompleteInputField = React.createClass({
  propTypes: {
    /* TODO: figure out how to data-* from hash object */
    changeFn: React.PropTypes.func,
    name: React.PropTypes.string,
    value: React.PropTypes.string,
    indexValue: React.PropTypes.number,
    placeholder: React.PropTypes.string
  },
  componentDidMount: function(){
    //if multiple same component in the root, it's always get's the last one
    handle = this;
    $(this.refs.autocomplete).autocomplete({
      serviceUrl: '/suggest',
      dataType:'json',
      deferRequestBy:100,
      paramName:'q',
      onSelect:function(suggestion){
        handle.props.changeFn({
          target: {
            value:suggestion.value,
            dataset: {index:$(this).attr('data-index'), value:'club_name', suggested_club:suggestion.data }
          }
        });
      }
    });
  },
  render: function(){
    var includesDanger = this.props.value == "" ? "form-control-danger" : "";
    return (
      <input ref="autocomplete" className={`form-control ${includesDanger}`} type="text"
        name={this.props.name} defaultValue={this.props.value}
        placeholder={this.props.placeholder}
        data-value="club_name" data-index={this.props.indexValue} />
    );
  }
});

var UserMembershipModal = React.createClass({
  propTypes: {memberships:React.PropTypes.array, csrfToken:React.PropTypes.string },
  getInitialState: function(){
    //clone the array
    var newMemberships = this.props.memberships.slice(0);

    return {memberships:newMemberships};
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
      handle.props.updateMembership(json.memberships);
      $(handle.refs.membershipModal).modal('hide');
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

    if("suggested_club" in e.target.dataset){
      newMemberships[e.target.dataset.index].golf_club_id = e.target.dataset.suggested_club;
    } else {
      newMemberships[e.target.dataset.index].golf_club_id = '';
    };

    this.setState( (prevState) => ( {memberships:newMemberships}));
  },
  deleteMembership: function(e){

    var handle = this;
    var target = e.target;
    var newMemberships = null;
    var clearPromise = new Promise(function(resolve,reject){
      newMemberships = handle.state.memberships.slice(0);
      handle.setState({memberships:[]});
      resolve("membership cleared");
    });

    clearPromise.then(function(success){
      newMemberships.splice(target.dataset.index, 1);
      handle.setState({memberships:newMemberships});
    });

  },
  resetForm: function(){
    var handle = this;
    var clearPromise = new Promise(function(resolve,reject){
      handle.setState({memberships:[]});
      resolve("memberhsip cleared!");
    });
    clearPromise.then(function(success){
      var newMemberships = handle.props.memberships.slice(0);
      handle.setState({memberships:newMemberships});
      $(handle.refs.membershipModal).modal('hide');

    })
  },
  render: function(){
    var disableUpdateBtn = Math.min(... this.state.memberships.map( (e,i) => e.club_name == ""));
    return (
      <div ref="membershipModal" className="modal fade" id="membershipModal" data-keyboard="false" data-backdrop="static">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" onClick={this.resetForm}><span>&times;</span></button>
              <h4 className="modal-title">Memberships Details</h4>
            </div>
            <div className="modal-body">
              <form className="container-fluid" method="post" id="membership-form" ref="membershipsForm" action={this.props.memberships_path}>
                <input type="hidden" name="authenticity_token" value={this.props.csrfToken} />
                <div className="">
                  { this.state.memberships.map( (e,i) => {
                    var random_id = randomID();
                    var includesDanger = e.club_name == "" ? "has-danger" : "";
                    return (
                      <div key={i} className="form-group row">
                        <input type="hidden" defaultValue={e.golf_club_id} name={`memberships[${random_id}][golf_club_id]`} />
                        <input type="hidden" defaultValue={e.id} name={`memberships[${random_id}][id]`} />
                        <div className={`col-md-7 col-12 mb-2 mb-sm-0 ${includesDanger}`}>
                          <AutoCompleteInputField name={`memberships[${random_id}][club_name]`}
                            changeFn={this.updateMembership} value={e.club_name}
                            placeholder="Club Name" indexValue={i}
                          />
                        </div>
                        <div className="col-md-3 col-12 mb-2 mb-sm-0">
                          <input type="date" defaultValue={e.expires_at}
                            name={`memberships[${random_id}][expires_at]`}
                            placeholder="Expires" data-index={i} data-value="expires_at" className="form-control expires_date_field" />
                        </div>
                        <div className="col-md-2 col-12 mb-2 mb-sm-0">
                          <button type="button" className="btn btn-danger" onClick={this.deleteMembership}
                            data-index={i} ><i className="fa fa-minus"></i></button>
                        </div>
                      </div>
                      );
                    })
                  }
                  <button type="button" className="btn btn-primary" onClick={this.newMembership}>
                    <i className="fa fa-plus"></i>
                  </button>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={this.resetForm}>Cancel</button>
              <button style={ {marginLeft:"5px"}} type="button" className="btn btn-primary"
                onClick={this.sendUpdates} disabled={disableUpdateBtn}>Update Membership
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
})

module.exports = UserMembershipCard;
