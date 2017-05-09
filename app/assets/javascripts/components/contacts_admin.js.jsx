
var ContactsModal = React.createClass({
  propTypes:{
    contacts:React.PropTypes.array,
    token:React.PropTypes.string
  },
  getInitialState:()=>{
    return {contact:null};
  },
  componentDidMount:function(){
    var handle = this;

    $(this.contactModal).on('show.bs.modal', (e)=>{
      var newContact = handle.props.contacts[e.relatedTarget.dataset.index];
      handle.setState({contact:newContact});
    });
  },
  handleChangeContact:function(e){
    //update the ur_contact state
    var newUrContact = (this.state.contact===null) ?
      Object.assign({}, UR_CONTACT_DEFAULTS) : this.state.contact;

    //reset id to null
    newUrContact.id = "";
    newUrContact = Object.assign(newUrContact, {[e.target.dataset.target]:e.target.value});
    this.setState({contact:newUrContact});
  },
  render:function(){
    var contactId = this.state.contact === null ? "" : this.state.contact.id;
    var contactName = this.state.contact === null ? "" : this.state.contact.name;
    var contactEmail = this.state.contact === null ? "" : this.state.contact.email;
    var contactTelephone = this.state.contact === null ? "" : this.state.contact.telephone;

    return (
      <div className="modal fade" id="contacts-modal" ref={(modal)=>{this.contactModal=modal;}}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">New/Edit Contact</h5>
              <button type="button" className="close" data-dismiss="modal">
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form action="/">
                <input type="hidden" value={this.props.token} name="authenticity_token" />
                <input type="hidden" value={contactId} />
                <div className="row form-group">
                  <label className="col-4 col-form-label">Name:</label>
                  <div className="col-8">
                    <input type="text" name="ur_contact[name]" placeholder="Name"
                      className="form-control"
                      data-target="name" value={contactName} onChange={this.handleChangeContact} />
                  </div>
                </div>
                <div className="row form-group">
                  <label className="col-4 col-form-label">Email:</label>
                  <div className="col-8">
                    <input type="text" name="ur_contact[email]" placeholder="Email"
                      className="form-control"
                      data-target="name" value={contactEmail} onChange={this.handleChangeContact} />
                  </div>
                </div>
                <div className="row form-group">
                  <label className="col-4 col-form-label">Telephone:</label>
                  <div className="col-8">
                    <input type="text" name="ur_contact[telephone]" placeholder="Telephone"
                      className="form-control"
                      data-target="name" value={contactTelephone} onChange={this.handleChangeContact} />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" type="button" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
});

var ContactsAdmin = React.createClass({
  propTypes:{
    token:React.PropTypes.string
  },
  getInitialState:()=>{
    return {contacts:null};
  },
  loadContacts:function(offset){
    var handle=this;

    fetch('/admin/contacts/load?' + $.param({offset:offset}), {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },

    }).then(function(response){
      if(response.status>=400){
        $.snackbar({content:'There are some errors updating the contact info', style:'error'});
        throw new Error(response.statusText);
        return;
      };

      return response.json();
    }).then(function(json){
      //abort if results is null or length is 0
      if(json===null){
        return;
      }
      if(json.length===0){
        return;
      }

      var newContacts = handle.state.contacts;
      if(newContacts===null){
        handle.setState({contacts:json});
      }else{
        newContacts = newContacts.concat(json);
        handle.setState({contacts:newContacts})
      }

      //recursively load until the contents are empty
      handle.loadContacts(handle.state.contacts.length)
    });
  },
  updateContact:function(newContact){

  },
  componentDidMount:function(){
    //start loading from offset
    this.loadContacts(0);
  },
  render:function(){
    if(this.state.contacts === null){
      return (
        <div>No contacts found...</div>
      )
    };

    return (
      <div>
        <ContactsModal contacts={this.state.contacts} token={this.props.token} updateContact={this.updateContact}/>
        <div className="card-columns-4">{ this.state.contacts.map((e,i) => {
            return (
              <div className="card d-inline-block w-100 mb-2" key={i}>
                <div className="card-block">
                  <h4 className="card-title">{e.name}</h4>
                  <ul className="list-unstyled">
                    <li>{e.email}</li>
                    <li>{e.telephone}</li>
                  </ul>
                  <p className="card-text text-right">
                    <a href="#contacts-modal" data-toggle="modal" data-index={i}>
                      <span className="fa-stack fa-lg">
                        <i className="fa fa-circle fa-stack-2x"></i>
                        <i className="fa fa-pencil fa-inverse fa-stack-1x"></i>
                      </span>
                    </a>
                    <span> </span>
                    <a href="" className="">
                      <span className="fa-stack fa-lg">
                        <i className="text-danger fa fa-circle fa-stack-2x"></i>
                        <i className="fa fa-times fa-inverse fa-stack-1x"></i>
                      </span>
                    </a>
                  </p>
                </div>
              </div>
            );
          })
        }</div>
      </div>
    );
  }
});
