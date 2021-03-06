import React, {PropTypes} from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import {RRule, RRuleSet,rrulestr} from 'rrule';
import CourseHeatmap from './CourseHeatmap';

class CourseCard extends React.Component {
  render(){
    return (<div className="card mb-2">
      <div className="card-body">
        <h4 className="card-title">{this.props.course.name}</h4>
        <CourseHeatmap courses={[this.props.course]} />
      </div>
      <div className="card-body">
        <h5>Course status and maintenance schedule</h5>
        <p> { `Course is ${this.props.course.course_status.available ? 'available': 'unavailable'}.`} </p>
        <p>Maintenance schedule is:-</p>
        <ul>
          {
            this.props.course.course_settings.length == 0 ?
              (<li>No maintenance schedule</li>) :
              (
                this.props.course.course_settings.map( (cs, cs_index) => {
                  return (<li key={cs_index}>{
                    cs.course_setting_property_id == 1 ? `Every week on ${getDayOfWeek(cs.value_int)}` :
                    cs.course_setting_property_id == 2 ? `Every month on the ${cs.value_int}` :
                    cs.course_setting_property_id == 3 ? `Every ${getGetOrdinal(JSON.parse(cs.value_string).week)} ${getDayOfWeek(JSON.parse(cs.value_string).day)} of the month` :
                    `Between ${cs.value_min} to ${cs.value_max}`
                   }</li>)
                })
              )
          }
        </ul>
      </div>
      <CourseEditForm clubId={this.props.clubId} csrf_token={this.props.csrf_token}
        loadCourses={this.props.loadCourses}
        statuses={this.props.statuses} setting_properties={this.props.setting_properties}
        course={this.props.course} />
    </div>);
  }
};


CourseCard.propTypes = {
    clubId:React.PropTypes.number,
    course:React.PropTypes.object, csrf_token:React.PropTypes.string,
    setting_properties:React.PropTypes.array
}

var CourseGlobalSettingForm = React.createClass({
  propTypes : {
    clubId:React.PropTypes.number,
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
    if(this.props.global_setting == null || this.props.clubId == null){
      return (<div>Nothing ...</div>);
    }

    var random_id = randomID();

    return (<div className="card mb-2">
      <div className="card-body">
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

var CourseMaintenanceSchGrp = React.createClass({
  propTypes:{
    index:React.PropTypes.number, deleteCourseSetting:React.PropTypes.func,
    setting_properties: React.PropTypes.array,
    course_setting:React.PropTypes.object
  },
  getInitialState:function(){ return {prop:this.props.course_setting.course_setting_property_id}; },
  componentWillReceiveProps: function(nextProp){
      //update the state.prop to the new prop
      this.setState({prop:nextProp.course_setting.course_setting_property_id});
  },
  updateProp: function(e){
    var newProp = this.state.prop;
    newProp = parseInt(e.target.value);
    this.setState({prop:newProp});
  },
  render: function(){
    var random_id = randomID();
    var handle = this;
    // the idea is to show the appropiate schedule based on the option selected

    //day of the week schedule
    var dayOfWeek = () => {
      return (<div>
        <input type="hidden" name={`course_setting[${random_id}][value_type]`} value="integer" />
        <select className="form-control" name={`course_setting[${random_id}][value_int]`} defaultValue={this.props.course_setting.value_int}>{
          arrayFromRange(0,6).map( (day,index) => {
              return (<option key={index} value={day}>{getDayOfWeek(day)}</option>);
          })
        }</select>
        <label></label>
      </div>);
    };

    //day of the month schedule
    var dayOfMonth = () => {
      return (<div>
        <input type="hidden" name={`course_setting[${random_id}][value_type]`} value="integer" />
        <select name={`course_setting[${random_id}][value_int]`} className="form-control" defaultValue={this.props.course_setting.value_int}> {
          arrayFromRange(1,28).map( (day,index) => {
            return (<option value={day} key={index}>{day}</option>);
          })
        }</select>
      </div>);
    }

    //Xst <day> of the month (1st sunday of the month)
    //will cause issues if value_string is not JSON parseable
    var nthDayOfMonth = () => {
      //copy and reassign value_string
      var new_cs = Object.assign({}, this.props.course_setting);
      new_cs.value_string = new_cs.value_string == null ? "{\"week\":\"1\",\"day\":\"0\"}" : new_cs.value_string;
      return (<div className="row">
        <input type="hidden" name={`course_setting[${random_id}][value_type]`} value="string" />
        <div className="col-4">
          <select name={`course_setting[${random_id}][value_string][week]`} defaultValue={JSON.parse(new_cs.value_string).week} className="form-control">
            <option value="1">1st</option>
            <option value="2">2nd</option>
            <option value="3">3rd</option>
            <option value="4">4th</option>
          </select>
        </div>
        <div className="col-8"><select name={`course_setting[${random_id}][value_string][day]`} defaultValue={JSON.parse(new_cs.value_string).day} className="form-control">{
            arrayFromRange(0,6).map( (day,index) => {
              return (<option value={day} key={index}>{getDayOfWeek(day)}</option>)
            })
          }</select>
        </div>
      </div>);

    }

    //specific schedule
    var specificDateRange = () => {
      return (<div>
        <input type="hidden" name={`course_setting[${random_id}][value_type]`} value="range" />
        <div className="form-group">
          <label>Form: </label>
          <input type="date" name={`course_setting[${random_id}][value_min]`}
            defaultValue={this.props.course_setting.value_min}
            className="form-control" />
        </div>
        <div className="form-group">
          <label>To: </label>
          <input type="date" name={`course_setting[${random_id}][value_max]`}
            defaultValue={this.props.course_setting.value_max}
            className="form-control"/>
        </div>
      </div>);

    }

    var scheduleDisplay = null;
    switch (this.state.prop) {
      case 1: scheduleDisplay=dayOfWeek(); break;
      case 2: scheduleDisplay=dayOfMonth(); break;
      case 3: scheduleDisplay=nthDayOfMonth(); break;
      case 4: scheduleDisplay=specificDateRange(); break;
      default: scheduleDisplay=dayOfWeek();
    }

    var cs_id = this.props.course_setting == null ? '' : this.props.course_setting.id;

    return (
      <div className="row">
        <input type="hidden" name={`course_setting[${random_id}][id]`} value={cs_id} />
        <div className="col-10">
          <select className="form-control" name={`course_setting[${random_id}][course_setting_property_id]`}
              defaultValue={this.props.course_setting.course_setting_property_id} onChange={this.updateProp}>{
              handle.props.setting_properties.slice(0,4).map( (setting_property,index) => {
                return (<option value={setting_property.id} key={index}>{setting_property.label}</option>)
              })

            }
          </select>
        </div>
        <div className="col-2">
          <button type="button" className="btn btn-danger" data-index={this.props.index}
            onClick={this.props.deleteCourseSetting}>
            <i className="fa fa-minus"></i>
          </button>
        </div>
        <div className="col-12 mt-2 mb-2"> { scheduleDisplay } </div>
        <div className="col-12">
          <hr />
        </div>
      </div>
    )
  }
});

var CourseEditForm = React.createClass({
  propTypes: {
    clubId:React.PropTypes.number, csrf_token:React.PropTypes.string,
    course:React.PropTypes.object,
    loadCourses: React.PropTypes.func
  },
  getInitialState:function(){
    return {
      course:this.props.course,
      defaultCourseSetting: {
        golf_clud_id:this.props.clubId, course_setting_property_id:1, value_type:'integer', value_int:0, value_string:"{\"week\":\"1\",\"day\":\"0\"}", value_min:0, value_max:0
      }
    };
  },
  componentWillReceiveProps:function(nextProps){
    //set the current state to the new props
    this.setState({course:nextProps.course });
  },
  updateSetting: function(){
    //update the setting here
    //reload the courses
    var handle = this;

    fetch(`/admin/golf_clubs/${this.props.clubId}/courses/${this.props.course.id}`, {
      credentials:'same-origin',
      method:'PATCH',
      body: new FormData(handle.settings_form)
    }).then( (response) => {
      if(response.status>=400){
        $.snackbar({content:'Error updating course settings', style:'error'});
        return;
      }

      $.snackbar({content:'Course settings updated', style:'notice'});
      //should toggle the collapsible form
      handle.toggle_edit();
      handle.props.loadCourses();

    });
  },
  newCourseSetting: function(e){
    var newCourse = this.state.course;
    //have to deep clone this since it does not push properly
    newCourse.course_settings.push(this.state.defaultCourseSetting);
    this.setState({course:newCourse});
  },
  deleteCourseSetting: function(e){
    var newCourse = this.state.course
    newCourse.course_settings.splice(e.target.dataset.index, 1);
    this.setState({course:newCourse});
  },
  toggle_edit: function(){
    $(this.edit_button).toggle();
    $(this.collapse_form).collapse('toggle');
  },
  render: function(){
    var random_id = randomID();

    if(this.props.course == null){
      return (<div>Nothing yet ...</div>);
    };

    return (<div className="card-body">
      <div className="collapse" id={`form-${random_id}`} ref={(form)=>{this.collapse_form=form;}}>
        <form ref={(form) => {this.settings_form = form;}}>
          <input type="hidden" value={this.props.csrf_token} name="authenticity_token" />
          <h4>Course Settings</h4>
          <div className="form-group">
            <label>Course Name</label>
            <input type="text" className="form-control" name="course_listing[name]" defaultValue={this.props.course.name}/>
          </div>
          <div className="form-group">
            <label>Course Status</label>
            <select className="form-control" name="course_listing[course_status_id]" defaultValue={this.props.course.course_status_id}>{
              this.props.statuses.map( (status, index) => {
                return (<option key={index} value={status.id}>{status.desc}</option>)
              })
            }</select>
          </div>
          <h4>Maintenance Settings</h4>
          <p>Course will be closed on the following schedule:-</p>
          {
            this.state.course.course_settings.map( (cs, index) => {
              return (<CourseMaintenanceSchGrp index={index} course_setting={cs}
                setting_properties={this.props.setting_properties}
                deleteCourseSetting={this.deleteCourseSetting} key={index} />);
            })
          }
          <div className="form-group">
            <button type="button" className="btn btn-primary" onClick={this.newCourseSetting}> <i className="fa fa-plus"></i> </button>
          </div>
          <button type="button" className="btn btn-primary mr-2" onClick={this.updateSetting}>Update</button>
          <button type="button" className="btn btn-secondary" onClick={this.toggle_edit} >Cancel</button>
        </form>
      </div>
      <p className="card-text">
        <button className="btn btn-primary" onClick={this.toggle_edit} ref={(button) => {this.edit_button = button;}}>Edit</button>
      </p>
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
    var handle = this;
    this.loadCourses();

    //load the course statuses
    fetch(`/admin/golf_clubs/${this.props.clubId}/courses/defaults`,{
      credentials:'same-origin'
    }).then( (response) => {
      return response.json();
    }).then( (json) => {
      handle.setState({statuses:json.course_statuses, setting_properties:json.course_setting_properties});
    });
  },
  render: function(){
    //default render
    if(this.state.courses.length == 0){
      return (<div className="card">
        <div className="card-body">No courses found ... </div>
      </div>);
    };

    var handle = this;

    return (<div className="col-12 col-lg-8">
      <CourseGlobalSettingForm
        clubId={this.props.clubId}
        global_setting={this.state.global_settings} csrf_token={this.props.csrf_token}
        loadCourses={this.loadCourses}/>
      {
        this.state.courses.map( (course, index) => {
          return (<CourseCard clubId={this.props.clubId}
            csrf_token={this.props.csrf_token} loadCourses={this.loadCourses}
            statuses={this.state.statuses} setting_properties={this.state.setting_properties}
            course={course} key={index}
            />);
        })
      }
    </div>);
  }
})

//module.exports = CourseAdmin;
export default CourseAdmin;
