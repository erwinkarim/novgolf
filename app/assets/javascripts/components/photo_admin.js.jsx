var PhotoHints = React.createClass({
  render: function(){
    return (
      <span>
        <a href="#photo-admin-hints" className="btn btn-info" data-toggle="modal">
          <i className="fa fa-question-circle"></i>
        </a>
        <div className="modal fade" id="photo-admin-hints">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Hints</h5>
                <button type="button" className="close" data-dismiss="modal">
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <h4>Photo Upload</h4>
                <ul>
                  <li>Large photos will be automatically resized to fix a 1920x1080 pixels box</li>
                  <li>Small Photo will be resized to fix a 1280x720 pixels box</li>
                  <li>If the resized photos is > 1MB it will not be uploaded</li>
                  <li>Only supported format is JPEG</li>
                </ul>
                <h4>Photo Gallery</h4>
                <ul>
                  <li>Click to Edit the caption or ordering</li>
                  <li>You can drag around the photos to re-arrange the photos</li>
                  <li>Re-arranging the photos then updating the caption will result the new arrangement to be lost</li>
                </ul>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" data-dismiss="modal" type="button">Ok</button>
              </div>
            </div>

          </div>
        </div>
      </span>
    );
  }
});

var PhotoUploader = React.createClass({
  componentDidMount: function(){
    var handle = this;
    $(this.refs.fileUploader).fileupload({
      acceptFileTypes:/(\.|\/)(jpe?g)$/i,
      maxFileSize: 1073741824,
      dataType:'json',
      disableImageResize:false, imageMaxWidth:1920, imageMaxHeight:1080,
      imageMinWidth:1280, imageMinHeight:720,
      submit: function(e,data){
        //record how many files is being loaded
        handle.props.updatePhotoWaiting(+1);
      },
      done: function(e,data){
        $.snackbar({content:data.result.photo.caption + " uploaded", style:'notice'});
        handle.props.updatePhotoWaiting(-1);
        handle.props.updatePhotoList();
      },
      fail: function(e, data){
        $.snackbar({content:"Some file failed to upload", style:'error'});
        console.log("e =", e);
      },
    });
  },
  render: function(){
    return (
      <div className="card mb-2">
        <div className="card-block">
            <span className="btn btn-success fileinput-button mr-2">
              <i className="fa fa-plus mr-2"></i>
              <span>Select or Drop files...</span>
              <input className="" ref="fileUploader" data-url={this.props.path} name="files[]" multiple={true} type="file" />
            </span>
            <PhotoHints />
        </div>
      </div>
    );
  }
});

var PhotoAdminModal = React.createClass({
  propTypes: {
    photo:React.PropTypes.object,
    photoList:React.PropTypes.array,
    selectedPhoto:React.PropTypes.number,
    token: React.PropTypes.string
  },
  getInitialState: function(){
    //clone the props
    var newPhoto = Object.assign({}, this.props.photo);

    return {photo:newPhoto};
  },
  componentWillReceiveProps: function(nextProps){
    //clone the props
    var newPhoto = Object.assign({}, nextProps.photo);

    this.setState({photo:newPhoto});
  },
  updateForm:function(e){

    var newPhoto = Object.assign(this.state.photo, {[e.target.dataset.name]:e.target.value} )
    this.setState({photo:newPhoto});

  },
  render: function(){
    if(this.props.photo == null){
     return <div></div>
    };

    return (
      <div className="modal fade" id="photo-detail">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-body">
              <form id="photo-form" action={this.props.photo.delete} method="PATCH">
                <input type="hidden" name="form_authentcity_token" value={this.props.token}/>

                <img src={this.props.photo.url} className="img-responsive mb-2" />
                <div className="form-group">
                  <label>Caption</label>
                  <input type="text" className="form-control" name="photo[caption]" value={this.state.photo.caption} data-name="caption" onChange={this.updateForm} placeholder="Caption" />
                </div>
                <div className="form-group row">
                  <label className="col-8">Order (higher sequence number will be shown first)</label>
                  <div className="col-4">
                    <select className="form-control" name="photo[sequence]" value={this.state.photo.sequence} data-name="sequence" onChange={this.updateForm}>{
                      this.props.photoList.map( (e,i) => {
                        return (
                          <option key={i} value={e.sequence}>{e.sequence}</option>
                        )
                      })}
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-danger" onClick={this.props.deletePhoto}>Delete</button>
              <button type="button" className="btn btn-primary" onClick={this.props.updatePhoto}>Update</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
});

var PhotoCard = React.createClass({
  propTypes: {
    photo:React.PropTypes.object,
    clickModal:React.PropTypes.func,
    index:React.PropTypes.number
  },
  componentDidMount: function(){
    //make this draggable
    var handle = this;

    $(this.dragElm).draggable({
      connectToSortable:'#sortable',
      stop:handle.props.trackNewSequence,
      start:function(){
        //show sequenceNav and add stickyness
        $('#sequenceNav').removeClass('d-none').sticky({topSpacing:10, zIndex:2000});
      }
    });

    //child rendered last, so sortable after child is rendered
    $('#sortable').sortable({
      containment:'#sortable'
    });
  },
  render: function(){
    return(
      <div className="col-3 photo-card" data-id={this.props.photo.id} ref={ (dragElm)=>{this.dragElm = dragElm; }}>
        <div className="card d-block mb-2">
          <a href="#photo-detail" data-toggle="modal" onClick={this.props.clickModal} data-index={this.props.index}>
            <img className="img-responsive" src={this.props.photo.square200} data-index={this.props.index}
              alt={this.props.photo.caption} />
          </a>
        </div>
      </div>
    );
  }
});

var PhotoAdminViewer =  React.createClass({
  propTypes: {
    photoList:React.PropTypes.array,
    token: React.PropTypes.string,
    photoWaiting: React.PropTypes.number
  },
  getInitialState: function(){
    return {
      random_id:(Math.floor(Math.random()*16777215).toString(16)),
      selectedPhoto:0,
      newSequence:[]
    }
  },
  componentDidMount: function(){
    /*
    $(this.sortElm).sortable({revert:true});
    */
  },
  trackNewSequence: function(){
    var newOrder = $.map( $('.photo-card'), function(obj){return parseInt(obj.dataset.id)});
    this.setState({newSequence:newOrder});
  },
  revertSequence: function(){
    this.props.updatePhotoList();
  },
  setNewSequence: function(){
    //tell rails that new sequence has been set
    var handle = this;

    $.ajax(this.props.path + '/update_sequence',{
      method:'PATCH',
      data: { sequence:this.state.newSequence.reverse()},
      success: function(data){
        handle.props.updatePhotoList();
      },
      error: function(jqXHR, textStatus){
        console.log('update sequence failed', jqXHR);
      }
    })
  },
  deletePhoto: function(e){
    e.preventDefault();
    var handle = this;
    console.log("delete submited");

    fetch(this.props.photoList[this.state.selectedPhoto].delete , {
      credentials:'same-origin',
      method:'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:JSON.stringify({ authenticity_token:this.props.token})
    }).then(function(response){
      $.snackbar({ content:"Photo deleted"});
      handle.setState({selectedPhoto:0});
      $('#photo-detail').modal('hide');
      handle.props.updatePhotoList();
    });
  },
  updatePhoto: function(e){
    e.preventDefault();
    var handle = this;
    $.ajax( this.props.photoList[this.state.selectedPhoto].delete, {
      data:$('#photo-form').serialize(),
      method:"PATCH",
      success: function(data){
        $.snackbar({content:"Photo updated."});
        handle.props.updatePhotoList();
      }
    });
    $('#photo-detail').modal('hide');
  },
  clickModal: function(e){
    this.setState({selectedPhoto:parseInt(e.target.dataset.index)})
  },
  render: function(){
    var handle = this;

    var gallery = this.props.photoList.length == 0 ? '' : this.props.photoList.map( (e,i) => {
       return (
         <PhotoCard key={i} photo={e} clickModal={this.clickModal} index={i} trackNewSequence={this.trackNewSequence}/>
       );
    });

    var loading = this.props.photoWaiting == 0 ? '' : arrayFromRange(1, this.props.photoWaiting).map( (e,i) => {
      return (
        <div key={i} className="col-3 mb-2">
         <div className="card d-block" style={ {height:'100%'}} >
           <p className="text-center">
             <i className="fa fa-cog fa-spin fa-4x"></i>
           </p>
         </div>
        </div>
      );
    });

    var sequenceNav = (
      <div className="col-12">
        <nav className="navbar navbar-light bg-faded mb-2 d-none" ref={(sequenceNav)=>{this.sequenceNav=sequenceNav;}} id="sequenceNav">
          <span className="navbar-text">Arrangement: </span>
          <form className="form-inline">
            <button type="button" className="btn btn-outline-primary mr-2" onClick={this.setNewSequence}>Set</button>
            <button type="button" className="btn btn-outline-danger" onClick={this.revertSequence}>Revert</button>
          </form>
        </nav>
      </div>
    );

    var photoList = (this.props.photoList.length != 0 || this.props.photoWaiting != 0) ? (
      <div>
        <PhotoAdminModal photo={this.props.photoList[this.state.selectedPhoto]} photoList={this.props.photoList}
         selectedPhoto={this.state.selectedPhoto}  token={this.props.token}
         updatePhoto={this.updatePhoto} deletePhoto={this.deletePhoto} />
       <div className="row mb-2">
         { sequenceNav }
       </div>
        <div className="row" id="sortable" style={ {float:'left'}} ref={ (sortElm) => {this.sortElm=sortElm;}} >
         {loading} {gallery}
        </div>
      </div>
    ) : (
      <div className="card">
        <div className="card-block">
          <p className="card-text">No Photos Yet...</p>
        </div>
      </div>
    )

    return photoList;
  }
});

var PhotoAdmin = React.createClass({
  propTypes: {
    crsfToken: React.PropTypes.string,
    paths: React.PropTypes.object
  },
  getInitialState: function(){
      return { photoList:[], photoWaiting:0}
  },
  componentDidMount: function(){
    this.updatePhotoList();
  },
  updatePhotoList: function(){
    var handle = this;
    handle.setState({photoList:[]});
    $.getJSON(this.props.paths.upload, function(data){
        handle.setState({ photoList:data, selectedPhoto:0, photoWaiting:0})
    })
  },
  updatePhotoWaiting: function(delta){
    var newPhotoCount = this.state.photoWaiting;
    this.setState({photoWaiting:newPhotoCount +  delta})
  },
  render: function() {
    return (
      <div className="row">
        <div className="col-12">
          <PhotoUploader path={this.props.paths.upload} updatePhotoList={this.updatePhotoList} updatePhotoWaiting={this.updatePhotoWaiting}/>
        </div>
        <div className="col-12">
          <PhotoAdminViewer path={this.props.paths.upload} photoList={this.state.photoList} updatePhotoList={this.updatePhotoList}
            photoWaiting={this.state.photoWaiting} token={this.props.crsfToken} draggable={this.refs.draggable}/>
        </div>
      </div>
    );
  }
});
