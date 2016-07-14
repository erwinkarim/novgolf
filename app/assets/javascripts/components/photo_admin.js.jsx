var PhotoUploader = React.createClass({
  componentDidMount: function(){
    var handle = this;
    $(this.refs.fileUploader).fileupload({
      acceptFileTypes:/(\.|\/)(jpe?g)$/i,
      maxFileSize: 1073741824,
      dataType:'json',
      done: function(){
        handle.props.updatePhotoList();
        console.log("done!!");
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
      </li>
    );
  }
});

var PhotoAdminViewer =  React.createClass({
  getInitialState: function(){
    return {photoList:[]}
  },
  render: function(){
    return (
      <li className="list-group-item"> {this.props.photoList.map( (e,i) =>
        (
          <div className="card">
            <div className="card-img-top card-img-bottom">
              <img src={e.url} className="img-fluid" />
            </div>
            </div>
        )
      )}</li>
    );
  }
});

var PhotoAdmin = React.createClass({
  propTypes: {
    paths: React.PropTypes.object,
  },
  componentDidMount: function(){
    this.updatePhotoList();
  },
  updatePhotoList: function(){
    var handle = this;
    $.getJSON(this.props.path, function(data){
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
          <PhotoAdminViewer path={this.props.paths.upload} photoList={this.state.photoList}/>
        </ul>
      </div>
    );
  }
});
