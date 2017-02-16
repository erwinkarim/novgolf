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
      <div className="card">
        <div className="card-block">
          <p className="card-text">No photos yet...</p>
        </div>
      </div>
    );

    var photoList = (
      <div className="row">{this.props.photoList.map( (e,i) => {
        var random_id= randomID();

        var photo_card = (
          <div key={i} className="col-4">
            <div className="card d-block mb-2">
              <a href={`#photo-collapse-${random_id}`} data-toggle="collapse">
                <img className="img-responsive" src={e.square200} />
              </a>
            </div>
          </div>
        );

        return (photo_card);
      })}
      </div>
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
      <div className="row">
        <div className="col-12">
          <PhotoUploader path={this.props.paths.upload} updatePhotoList={this.updatePhotoList}/>
        </div>
        <div className="col-12">
          <PhotoAdminViewer path={this.props.paths.upload} photoList={this.state.photoList} updatePhotoList={this.updatePhotoList}
            crsfToken={this.props.crsfToken}/>
        </div>
      </div>
    );
  }
});
