
var ContactsModal = React.createClass({
  propTypes:{
    contacts:React.PropTypes.array,
    token:React.PropTypes.string
  },
  getInitialState:()=>{
    return {contact:null, selectedContact:null};
  },
  componentDidMount:function(){
    var handle = this;

    $(this.contactModal).on('show.bs.modal', (e)=>{
      var newContact = e.relatedTarget.dataset.index == -1 ?
        Object.assign({}, UR_CONTACT_DEFAULTS) :
        handle.props.contacts[e.relatedTarget.dataset.index];
      handle.setState({contact:newContact, selectedContact:e.relatedTarget.dataset.index});
    });
  },
  handleChangeContact:function(e){
    //update the ur_contact state
    var newUrContact = (this.state.contact===null) ?
      Object.assign({}, UR_CONTACT_DEFAULTS) : this.state.contact;

    newUrContact = Object.assign(newUrContact, {[e.target.dataset.target]:e.target.value});
    this.setState({contact:newUrContact});
  },
  handleUpdateContact:function(e){
    this.props.updateContact(Object.assign({},this.state.contact), new FormData(this.contactForm), this.state.selectedContact);
    $(this.contactModal).modal('hide');
  },
  handleCreateContact:function(e){
    this.props.createContact(new FormData(this.contactForm));
    $(this.contactModal).modal('hide');

  },
  render:function(){
    var formMode = this.state.selectedContact == -1 ? "create" : "edit";
    var contactId = this.state.contact === null ? "" : this.state.contact.id;
    var contactName = this.state.contact === null ? "" : this.state.contact.name;
    var contactEmail = this.state.contact === null ? "" : this.state.contact.email;
    var contactTelephone = this.state.contact === null ? "" : this.state.contact.telephone;

    return (
      <div className="modal fade" id="contacts-modal" ref={(modal)=>{this.contactModal=modal;}}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{toTitleCase(formMode)} Contact</h5>
              <button type="button" className="close" data-dismiss="modal">
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form action="/" ref={(form)=>{this.contactForm=form;}}>
                <input type="hidden" value={this.props.token} name="authenticity_token" />
                <input type="hidden" value={contactId}  name="ur_contact[id]"/>
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
                      data-target="email" value={contactEmail} onChange={this.handleChangeContact} />
                  </div>
                </div>
                <div className="row form-group">
                  <label className="col-4 col-form-label">Telephone:</label>
                  <div className="col-8">
                    <input type="text" name="ur_contact[telephone]" placeholder="Telephone"
                      className="form-control"
                      data-target="telephone" value={contactTelephone} onChange={this.handleChangeContact} />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" type="button" data-dismiss="modal">Close</button>
              <button className="btn btn-primary" type="button"
                onClick={formMode == "edit" ? this.handleUpdateContact : this.handleCreateContact}>
                {toTitleCase(formMode)} Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
});

var ConfirmDeleteContactModal = React.createClass({
  getInitialState:()=>{
    return {contact_index:null}
  },
  componentDidMount:function(){
    var handle = this;
    $(this.contactModal).on('show.bs.modal', function(e){
      handle.setState({contact_index:e.relatedTarget.dataset.index})
    })
  },
  handleDeleteContact:function(e){
    this.props.deleteContact(this.state.contact_index);
    $(this.contactModal).modal('hide');
  },
  render:function(){
    return (
      <div className="modal" id="contact-delete-confirm-dialog" ref={(modal)=>{this.contactModal=modal;}}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-body">
              Really Delete the contact?
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-danger" onClick={this.handleDeleteContact}>Confirm</button>
            </div>
          </div>
        </div>
      </div>
    );
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
  createContact:function(form_data){
    //creat the contact
    console.log("create contact with", form_data);
    var handle = this;

    fetch('/admin/contacts', {
      method:'POST',
      body:form_data,
      credentials:'same-origin'
    }).then(function(response){
      //error handling
      if(response.status>=400){
        $.snackbar({content:'There are some errors creating the contact', style:'error'});
        throw new Error(response.statusText);
        return;
      }

      return response.json();
    }).then(function(json){
      var newContacts = handle.state.contacts;
      newContacts.push(json);
      handle.setState({contacts:newContacts});

      $.snackbar({content:'Contact created', style:'notice'});
    });
  },
  deleteContact:function(contact_index){
    var handle = this;
    var contact_id = this.state.contacts[contact_index].id;
    //done after confirm deleting the contact
    fetch(`/admin/contacts/${contact_id}`,{
      method:'DELETE',
      credentials:'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authenticity_token:handle.props.token })
    }).then(function(response){
      if(response.status>=400){
        $.snackbar({content:'Error deleting the contact', style:'error'});
        throw new Error(response.statusText);
        return
      };

      return response.json();
    }).then(function(json){
      var newContacts = handle.state.contacts;
      newContacts.splice(contact_index,1);
      handle.setState({contacts:newContacts});

      $.snackbar({content:'Contact deleted', style:'notice'});
    });

  },
  updateContact:function(contact, form_data, contact_index){
    console.log("update contacts with id", contact.id, " and form data", form_data);
    var handle = this;

    fetch(`/admin/contacts/${contact.id}`, {
      method:'PATCH',
      body:form_data,
      credentials:'same-origin'
    }).then(function(response){
      //error handling
      if(response.status>=400){
        $.snackbar({content:'There some errors updating the contact', style:'error'});
        throw new Error(response.statusText);
        return;
      }

      return response.json();
    }).then(function(json){
      //update the current contact state
      var newContacts = handle.state.contacts;
      newContacts[contact_index] = contact;
      handle.setState({contacts:newContacts});

      $.snackbar({content:'Contact Updated', style:'notice' });
    });

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
        <ContactsModal contacts={this.state.contacts} token={this.props.token}
          updateContact={this.updateContact} createContact={this.createContact}/>
        <ConfirmDeleteContactModal deleteContact={this.deleteContact} />
        <div className="w-100">
          <input type="text" className="form-control" ref={(input)=>{this.searchInput=input;}} />
          <a href="#contacts-modal" data-index="-1" data-toggle="modal">
            <span className="fa-stack fa-lg">
              <i className="fa fa-circle fa-stack-2x"></i>
              <i className="fa fa-plus fa-inverse fa-stack-1x"></i>
            </span>
          </a>
        </div>
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
                    <a href="#contact-delete-confirm-dialog" data-toggle="modal" data-index={i}>
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
