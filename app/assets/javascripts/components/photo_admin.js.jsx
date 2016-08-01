var PhotoUploader = React.createClass({
  componentDidMount: function(){
    var handle = this;
    $(this.refs.fileUploader).fileupload({
      acceptFileTypes:/(\.|\/)(jpe?g)$/i,
      maxFileSize: 1073741824,
      dataType:'json',
      disableImageResize:false, imageMaxWidth:1920, imageMaxHeight:1080,
      imageMinWidth:1280, imageMinHeight:720,
      done: function(){
        $.snackbar({content:"New photo uploaded"});
        handle.props.updatePhotoList();
        console.log("done!!");
      },
      fail: function(e, data){
          console.log("e =", e);
      }
    });
  },
  render: function(){
    return (
      <li className="list-group-item">
        <span className="btn btn-success fileinput-button">
          <i class="fa fa-plus"></i>
          <span>Select or Drop files...</span>
          <input className="" ref="fileUploader" data-url={this.props.path} name="files[]" multiple={true} type="file" />
        </span>
        <span>
          <ul>
            <li>Large photos will be automatically resized to fix a 1920x1080 pixels box</li>
            <li>Small Photo will be resized to fix a 1280x720 pixels box</li>
            <li>If the resized photos is > 1MB it will not be uploaded</li>
            <li>Only supported format is JPEG</li>
          </ul>
        </span>
      </li>
    );
  }
});

var PhotoAdminViewer =  React.createClass({
  getInitialState: function(){
    return {
      photoList:[],
      random_id:(Math.floor(Math.random()*16777215).toString(16))
    }
  },
  deletePhoto: function(e){
    e.preventDefault();
    var handle = this;
    console.log("delete submited");
    console.log("e.target = ", $(e.target).attr('action'));
    $.ajax($(e.target).attr('action'), {
        data:$(e.target).serialize(),
        method:"DELETE",
        success: function(data){
          $.snackbar({ content:"Photo deleted"});
          handle.props.updatePhotoList();
        }
    });
  },
  updatePhoto: function(e){
    e.preventDefault();
    var handle = this;
    $.ajax( $(e.target).attr("action"), {
      data:$(e.target).serialize(),
      method:"PATCH",
      success: function(data){
        $.snackbar({content:"Photo caption updated."});
        handle.props.updatePhotoList();
      }
    });
    console.log("update photo");
  },
  render: function(){
    var zeroPhotos = (
      <li className="list-group-item">
        No Photos yet...
      </li>
    );

    var photoList = (
      <li className="list-group-item"><section data-featherlight-gallery data-featherlight-filter="a">{this.props.photoList.map( (e,i) => {
        var random_id = randomID();

        return (
          <div className="card" key={i}>
            <a className="gallery card-img-top" href={e.url}>
              <img className="img-responsive" src={e.url} />
            </a>
            <div className="card-block">
              <form action={e.delete} onSubmit={this.updatePhoto} >
                <input type="hidden" name="authenticity_token" value={this.props.crsfToken} />
                <fieldset className="form-group">
                  <label>Caption</label>
                  <input type="text" defaultValue={e.name} className="form-control" name="photo[caption]" />
                </fieldset>
                <button className="btn btn-primary" type="submit">Update Photo</button>
              </form>
              <button className="btn btn-link" data-toggle="collapse" data-target={`#delete-${random_id}`}>Delete Photo</button>
              <div className="collapse" id={`delete-${random_id}`}>
                <div className="card">
                  <div className="card-block">
                    <form action={e.delete} onSubmit={this.deletePhoto} >
                      <input type="hidden" name="authenticity_token" value={this.props.crsfToken} />
                      <button className="btn btn-danger" type="submit" data-confirm="Are You Sure?">Delete</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      )}</section></li>

    );

    if(this.props.photoList.length == 0){
      return zeroPhotos;
    } else {
      return photoList;
    }
  }
});

var PhotoAdmin = React.createClass({
  propTypes: {
    crsfToken: React.PropTypes.string,
    paths: React.PropTypes.object
  },
  componentDidMount: function(){
    this.updatePhotoList();
  },
  updatePhotoList: function(){
    var handle = this;
    $.getJSON(this.props.paths.upload, function(data){
        handle.setState({ photoList:data})
    })
  },
  getInitialState: function(){
      return { photoList:[]}
  },
  render: function() {
    return (
      <div className="card">
        <ul className="list-group list-group-flush">
          <PhotoUploader path={this.props.paths.upload} updatePhotoList={this.updatePhotoList}/>
          <PhotoAdminViewer path={this.props.paths.upload} photoList={this.state.photoList} updatePhotoList={this.updatePhotoList}
            crsfToken={this.props.crsfToken}/>
        </ul>
      </div>
    );
  }
});