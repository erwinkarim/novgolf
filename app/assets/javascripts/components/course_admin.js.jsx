
var CourseCard = React.createClass({
  propTypes: {course:React.PropTypes.object},
  render: function(){
    return (<div className="card mb-2">
      <div className="card-block">
        <h4 className="card-title">{this.props.course.name}</h4>
        <p className="card-text">Lay out the off schedule here</p>
        <p className="card-text">Graphical representation of when this thing is going to be close would be nice</p>
      </div>
      <CourseEditForm />
    </div>);
  }
});

var CourseGlobalSettingForm = React.createClass({
  propTypes: {
    clubId:React.PropTypes.integer,
    global_settings:React.PropTypes.object, csrf_token:React.PropTypes.string
  },
  updateGlobalSetting: function(e){
    //update global setting and load the whole course
    var handle = this;

    fetch(`/admin/golf_clubs/${this.props.clubId}/courses/global_setting`, {
      credentials:'same-origin',
      method:'PATCH',
      body: new FormData(handle.globalSettingForm)
    }).then((response)=> {
      //throw error if status > 100
      if(response.status >= 400){
        $.snackbar({content:'Error updating global setting', style:'error'});
        return 0;
      }

      $.snackbar({content:'Course Global Settings updated', style:'notice'});
      handle.loadCourses();
    });

  },
  render: function(){
    if(this.props.global_setting == null){
      return (<div>Nothing ...</div>);
    }

    var random_id = randomID();

    return (<div className="card mb-2">
      <div className="card-block">
        <div className="w-100 d-flex justify-content-start">
          <span className="align-self-center">
            <h3> Global Settings </h3>
          </span>
          <span className="align-self-center ml-auto">
            <a href={`#global-setting-form-${random_id}`} data-toggle="collapse">
              <span className="fa-stack fa-lg">
                <i className="fa fa-circle fa-stack-2x"></i>
                <i className="fa fa-pencil fa-stack-1x fa-inverse"></i>
              </span>
            </a>
          </span>

        </div>
        <table className="table">
          <thead>
            <tr><th>Property</th><th>Value</th></tr>
          </thead>
          <tbody>
            <tr><th>Admin Selection</th><td>{this.props.global_setting.admin_selection}</td></tr>
            <tr><th>User Selection</th><td>{this.props.global_setting.user_selection}</td></tr>
          </tbody>
        </table>
        <p className="card-text">
        </p>
        <div className="collapse" id={`global-setting-form-${random_id}`}>
          <form ref={(form)=>{ this.globalSettingForm=form;}}>
            <input type="hidden" name="authenticity_token" value={this.props.csrf_token} />
            <h4>Edit Global Settings</h4>
            <hr />
            <div className="form-group">
              <label>Course Selection</label>
              <table className="table">
                <thead>
                  <tr>
                    <th>Facing</th>
                    <th>Auto</th>
                    <th>Manual</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Admin</td>
                    <td><input type="radio" name="admin_selection" defaultChecked={this.props.global_setting.admin_selection_value==0} value="0"/></td>
                    <td><input type="radio" name="admin_selection" defaultChecked={this.props.global_setting.admin_selection_value==1} value="1"/></td>
                  </tr>
                  <tr>
                    <td>Customer</td>
                    <td><input type="radio" name="user_selection" defaultChecked={this.props.global_setting.user_selection_value==0} value="0"/></td>
                    <td><input type="radio" name="user_selection" defaultChecked={this.props.global_setting.user_selection_value==1} value="1"/></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="form-group">
              <button type="button" className="btn btn-primary" onClick={this.updateGlobalSetting}>Update Global Setting</button>
            </div>
          </form>
        </div>
      </div>
    </div>);
  }
});

var CourseEditForm = React.createClass({
  propTypes: {course:React.PropTypes.object},
  render: function(){
    var random_id = randomID();

    return (<div className="card-block">
      <p className="card-text">
        <a href={`#form-${random_id}`} data-toggle="collapse">
          <span className="fa-stack fa-lg">
            <i className="fa fa-circle fa-stack-2x"></i>
            <i className="fa fa-pencil fa-stack-1x fa-inverse"></i>
          </span>
        </a>
      </p>
      <div className="collapse" id={`form-${random_id}`}>
        <form>
          <h4>Course Settings</h4>
          <div className="form-group">
            <label>Course Name</label>
            <input type="text" className="form-control" />
          </div>
          <h4>Maintainance Settings</h4>
          <p>Course will be closed on the following schedule:-</p>
          <button type="button" className="btn btn-primary">Update</button>
        </form>
      </div>
    </div>)
  }
});

var CourseAdmin = React.createClass({
  propTypes:{
    clubId:React.PropTypes.number, csrf_token:React.PropTypes.string
  },
  getInitialState: () => { return {courses:[]}},
  loadCourses: function(){
    var handle = this;

    //load the courses
    if(this.props.clubId > 0){
      fetch(`/admin/golf_clubs/${handle.props.clubId}/courses.json`, {
        credentials:'same-origin'
      }).then( (response) => {
        return response.json()
      }).then( (json) => {
        handle.setState({courses:json.course_listings, global_settings:json.course_global_setting});
      });
    }

  },
  componentDidMount: function(){
    this.loadCourses();
  },
  render: function(){
    //default render
    if(this.state.courses.length == 0){
      return (<div className="card">
        <div className="card-block">No courses found ... </div>
      </div>);
    };

    var handle = this;

    return (<div className="col-12 col-md-6">
      <CourseGlobalSettingForm
        clubId={this.props.clubId}
        global_setting={this.state.global_settings} csrf_token={this.props.csrf_token}
        loadCourses={this.loadCourses}/>
      {
        this.state.courses.map( (course, index) => {
          return (<CourseCard course={course} key={index} />);
        })
      }
    </div>);
  }
})
