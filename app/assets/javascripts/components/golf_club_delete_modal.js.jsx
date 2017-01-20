var GolfClubDeleteModal = React.createClass({
  propTypes: {
    clubName:React.PropTypes.string,
    delete_path:React.PropTypes.string,
    token:React.PropTypes.string
  },
  testClubName: function(e){
    //check the value in the form against pros.clubName
    if(this.props.clubName == $(this.refs.club_name).val() ){

      console.log('club name matched');
      fetch(this.props.delete_path, {
        credentials:'same-origin',
        headers: { 'Content-Type': 'application/json' },
        method:'DELETE',
        body: JSON.stringify({authenticity_token:this.props.token})
      }).then(function(response){
        window.location.href = "/admin/golf_clubs"
      });
    } else {
      $(this.refs.club_name).val('');
      $.snackbar({content:'Club Name did not match. Deletion canceled', style:'error'});
    }

    $(this.refs.deleteClubModal).modal('hide');
  },
  render: function(){
    return (
      <div className="modal fade" id="deleteClubModal" ref="deleteClubModal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Delete Club</h5>
              <button type="button" data-dismiss="modal" className="close"><span aria-hidden="true">&times;</span></button>
            </div>
            <div className="modal-body">
              <p className="text-danger">You are about to delete this club. Please enter the club name to really delete the club</p>
              <form className="form" action="/">
                <div className="form-group">
                  <input className="form-control" type="text" defaultValue="" placeholder="Club Name" ref="club_name"/>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
              <button className="btn btn-danger" type="button" onClick={this.testClubName}>Delete Club</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
})
