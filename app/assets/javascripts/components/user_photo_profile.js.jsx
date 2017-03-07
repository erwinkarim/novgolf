var UserPhotoProfile = React.createClass({
  propTypes:{
    crsfToken: React.PropTypes.string,
    user: React.PropTypes.object,
    upload_path: React.PropTypes.string
  },
  getInitialState: function(){
    return {
      user:this.props.user
    }
  },
  componentDidMount: function(){
    var handle = this;
    $(this.refs.fileUploader).fileupload({
      acceptFileTypes:/(\.|\/)(jpe?g)$/i,
      maxFileSize: 1073741824,
      dataType:'json',
      disableImageResize:false, imageMaxWidth:500, imageMaxHeight:500,
      done: function(e,data){
        var newUser = Object.assign({}, data.result);
        handle.setState({user:newUser});
        $.snackbar({content:"Profile picture updated"});
      },
      fail: function(e){
        console.log("failure to update photo profile, e= ", e);
      }
    });
  },
  render: function() {
    return (
      <div className="card">
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            <img src={this.state.user.image_path} className="rounded-circle center-block img-responsive" />
          </li>
          <li className="list-group-item">
            <span>
              <ul>
                <li>The image will scale and corp to fit a 400x400 pixel box</li>
                <li>The scaled image must not be more than 1MB</li>
                <li>Only your latest photo will be use as the profile picture</li>
              </ul>
            </span>
          </li>
          <li className="list-group-item">
            <span className="btn btn-success fileinput-button">
              <i className="fa fa-plus"></i>
              <span> Select or Drop files...</span>
              <input className="" ref="fileUploader" data-url={this.props.path} name="files[]" type="file" />
            </span>
          </li>
        </ul>
      </div>

    );
  }
});
