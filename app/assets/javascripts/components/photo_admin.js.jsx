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
        handle.props.updatePhotoWaiting(data.files.length);
        console.log('sending file', data.files);
      },
      done: function(){
      $.snackbar({content:"New photo uploaded"});
        handle.props.updatePhotoList();
        console.log("done!!");
      },
      fail: function(e, data){
          console.log("e =", e);
      },
    });
  },
  render: function(){
    return (
      <div className="card mb-2">
        <div className="card-block">
          <p className="card-text">
            <span className="btn btn-success fileinput-button">
              <i className="fa fa-plus mr-2"></i>
              <span>Select or Drop files...</span>
              <input className="" ref="fileUploader" data-url={this.props.path} name="files[]" multiple={true} type="file" />
            </span>
          </p>
        </div>
        <div className="card-block">
          <ul>
            <li>Large photos will be automatically resized to fix a 1920x1080 pixels box</li>
            <li>Small Photo will be resized to fix a 1280x720 pixels box</li>
            <li>If the resized photos is > 1MB it will not be uploaded</li>
            <li>Only supported format is JPEG</li>
          </ul>
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
                  <label className="col-8">Order</label>
                  <div className="col-4">
                    <select className="form-control" value={this.props.selectedPhoto}>{ this.props.photoList.map( (e,i) => {
                      return (
                        <option key={i} value={i}>{i}</option>
                      )
                    })}</select>
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

var PhotoAdminViewer =  React.createClass({
  propTypes: {
    photoList:React.PropTypes.array,
    token: React.PropTypes.string,
    photoWaiting: React.PropTypes.number
  },
  getInitialState: function(){
    return {
      random_id:(Math.floor(Math.random()*16777215).toString(16)),
      selectedPhoto:0
    }
  },
  deletePhoto: function(e){
    e.preventDefault();
    var handle = this;
    console.log("delete submited");
    console.log("e.target = ", $(e.target).attr('action'));

    /*
    $.ajax(this.props.photoList[this.state.selectedPhoto].delete, {
        method:"DELETE",
        success: function(data){

          //at this point, the modal might be invalid because state.selectedPhoto, might be an invalid obj
          $('#photo-detail').modal('hide');
        }
    });
    */

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
        $.snackbar({content:"Photo caption updated."});
        handle.props.updatePhotoList();
      }
    });
    $('#photo-detail').modal('hide');
    console.log("update photo with", e);
  },
  clickModal: function(e){
    this.setState({selectedPhoto:parseInt(e.target.dataset.index)})
  },
  render: function(){
    var handle = this;

    var gallery = this.props.photoList.length == 0 ? '' : this.props.photoList.map( (e,i) => {
       return (
         <div key={i} className="col-3">
           <div className="card d-block mb-2">
             <a href="#photo-detail" data-toggle="modal" onClick={this.clickModal} data-index={i}>
               <img className="img-responsive" src={e.square200} data-index={i}/>
             </a>
           </div>
         </div>
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

    var photoList = (this.props.photoList.length != 0 || this.props.photoWaiting != 0) ? (
      <div className="row">
        <PhotoAdminModal photo={this.props.photoList[this.state.selectedPhoto]} photoList={this.props.photoList}
         selectedPhoto={this.state.selectedPhoto}  token={this.props.token}
         updatePhoto={this.updatePhoto} deletePhoto={this.deletePhoto} />
       {loading} {gallery}
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
    $.getJSON(this.props.paths.upload, function(data){
        handle.setState({ photoList:data, selectedPhoto:0, photoWaiting:0})
    })
  },
  updatePhotoWaiting: function(photoCount){
      this.setState({photoWaiting:photoCount})
  },
  render: function() {
    return (
      <div className="row">
        <div className="col-12">
          <PhotoUploader path={this.props.paths.upload} updatePhotoList={this.updatePhotoList} updatePhotoWaiting={this.updatePhotoWaiting}/>
        </div>
        <div className="col-12">
          <PhotoAdminViewer path={this.props.paths.upload} photoList={this.state.photoList} updatePhotoList={this.updatePhotoList}
            photoWaiting={this.state.photoWaiting} token={this.props.crsfToken}/>
        </div>
      </div>
    );
  }
});
