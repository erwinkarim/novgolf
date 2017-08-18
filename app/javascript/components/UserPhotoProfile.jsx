var React = require('react');

var UserPhotoProfile = React.createClass({
  propTypes:{
    crsfToken: React.PropTypes.string,
    user: React.PropTypes.object,
    upload_path: React.PropTypes.string,
    user_path: React.PropTypes.string
  },
  getInitialState: function(){
    return {
      user:this.props.user, mode:'ready'
    }
  },
  componentDidMount: function(){
    var handle = this;
    $(this.fileUploader).fileupload({
      acceptFileTypes:/(\.|\/)(jpe?g)$/i,
      maxFileSize: 1073741824,
      dataType:'json',
      disableImageResize:false, imageMaxWidth:500, imageMaxHeight:500,
      start: function(e){
        //console.log(e);
        console.log('start loading new photo');
        handle.setState({mode:'loading'});
        $.snackbar({content:'Uploading new profile picture'});
      },
      progress: function(e, data){
        var progress = parseInt(data.loaded / data.total * 100, 10);
        //console.log("progress", progress);
      },
      done: function(e,data){
        console.log('done uploading picture');
        var newUser = Object.assign({}, data.result);
        handle.setState({user:newUser, mode:'ready'});
        $.snackbar({content:"Profile picture updated", style:'notice'});
      },
      fail: function(e){
        $.snackbar({content:'Failed to upload profile picture', style:'error'});
        handle.setState({mode:'ready'});
        console.log("failure to update photo profile, e= ", e);
      }
    });
  },
  render: function() {
    /*
    var loadingBtn = this.state.mode == 'ready' ? (
      <span className="btn btn-success fileinput-button mr-2">
        <i className="fa fa-plus"></i>
        <span> Select or Drop files...</span>
        <input className="" ref={(btn)=> { this.fileUploader=btn;}} data-url={this.props.upload_path} name="files[]" type="file" />
      </span>
    ) : (
      <span className="btn btn-success mr-2">
        <i className="fa fa-cog fa-spin"></i>
        <span> Updating profile picture...</span>
      </span>
    );
    */
    var btnLabel = this.state.mode == 'ready' ?
      ( <span> <i className="fa fa-plus"></i> Select or Drop files... </span> ) :
      (
        <span> <i className="fa fa-cog fa-spin"></i> <span> Updating profile picture...</span> </span>
      );

    var loadingBtn = (
      <span className="btn btn-success fileinput-button mr-2">
        {btnLabel}
        <input className="" ref={(btn)=> { this.fileUploader=btn;}} data-url={this.props.upload_path} name="files[]" type="file" />
      </span>
    );

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
            {loadingBtn}
            <a href={this.props.user_path} className="btn btn-secondary">Cancel</a>
          </li>
        </ul>
      </div>

    );
  }
});

module.exports = UserPhotoProfile;
