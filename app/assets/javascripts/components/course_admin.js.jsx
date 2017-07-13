
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
                  <td><input type="radio" /></td>
                  <td><input type="radio" /></td>
                </tr>
                <tr>
                  <td>Customer</td>
                  <td><input type="radio" /></td>
                  <td><input type="radio" /></td>
                </tr>
              </tbody>
            </table>
          </div>
          <h4>Maintainance Settings</h4>
          <p>Maintainance schedule is here</p>
          <button type="button" className="btn btn-primary">Update</button>
        </form>
      </div>
    </div>)
  }
});

var CourseAdmin = React.createClass({
  propTypes:{ clubId:React.PropTypes.number},
  getInitialState: () => { return {courses:[]}},
  componentDidMount: function(){
    var handle = this;
    //load the courses
    if(this.props.clubId > 0){
      fetch(`/admin/golf_clubs/${handle.props.clubId}/courses.json`, {
        credentials:'same-origin'
      }).then( (response) => {
        return response.json()
      }).then( (json) => {
        handle.setState({courses:json.course_listings});
      });
    }
  },
  render: function(){
    //default render
    if(this.state.courses.length == 0){
      return (<div className="card">
        <div className="card-block">No courses found ... </div>
      </div>);
    };

    var handle = this;

    return (<div className="col-12 col-md-6">{
      this.state.courses.map( (course, index) => {
        return (<CourseCard course={course} key={index} />);
      })
    }</div>);
  }
})
