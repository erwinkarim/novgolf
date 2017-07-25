var React = require('react');
var FlightFunctions = require('./FlightFunctions');

var CourseSelection = React.createClass({
  propTypes: {
    courses:React.PropTypes.array,
    flightInfo:React.PropTypes.object,
    adminMode:React.PropTypes.bool,
    updatePrice: React.PropTypes.func,
    selectedCourse: React.PropTypes.number
  },
  getDefaultProps: ()=>{
    return {adminMode:false, updatePrice:()=>{return null;}, selectedCourse:0}
  },
  render: function(){
    //return just the hidden input if there's only 1 course
    if(this.props.courses.length == 1){
      return (
        <div>
          <input type="hidden" name={`flight[${this.props.flightInfo.id}][courses][first_course]`} value={this.props.courses[0].id} />
          <input type="hidden" name={`flight[${this.props.flightInfo.id}][courses][second_course]`} value={this.props.courses[0].id} />
        </div>
      );
    }

    var handle = this;
    //if adminMode == true, it will only highlight the courses that is being used
    // by the highlighted reservation in the dashboard

    return (
      <div>
        <hr />
        {["first","second"].map( (course_name,course_index) => {
          // the course selection. will select first available course
          //  when in admin mode, only show if the current selected course is not null
          var selectedReservationId = this.props.courses[this.props.selectedCourse].first_reservation_id;

          var firstAvailableIndex = handle.props.courses.findIndex((e) => {
            return e[`${course_name}_reservation_id`] == null;
          });
          if(this.props.adminMode && selectedReservationId != null){
            firstAvailableIndex = -1;
          };

          var tee_time = course_name == "first" ?
            handle.props.flightInfo.teeTime :
            handle.props.flightInfo.second_tee_time;

          return (
            <div key={course_index} className="form-group row mb-1">
              <label className="col-12">{`${toTitleCase(course_name)} course (${tee_time}):`}</label>
              <div className="col-12">
                <div className="btn-group flex-wrap" data-toggle="buttons" ref={(input)=>{this[`${course_name}_btn_group`] = input;}}>
                  {
                    handle.props.courses.map((e,i) => {
                      var course_status = "secondary"
                      var disable_course = false;
                      if(handle.props.adminMode){
                        /*
                          if selectedReservationId is not null, highlight the courses that is being selected
                          if selectedReservationId is null, highlight the selected course for the first
                            and first available course for the second
                          if in admin mode, only show the status of courses that is being selected
                        */
                        if(e[`${course_name}_reservation_id`] == null){
                          if(course_name=="first"){
                            firstAvailableIndex = handle.props.selectedCourse;
                          }
                        } else {
                          //disable the course if the course has been occupied
                          course_status = course_status + " disabled";
                          disable_course = true;

                          //highlight the selected course if matches
                          if(e[`${course_name}_reservation_id`] == selectedReservationId){
                            course_status = FlightFunctions.reserveColor(e[`${course_name}_reservation_status`]);
                          };
                        }
                      } else {
                        course_status = FlightFunctions.reserveColor(e[`${course_name}_reservation_status`]);
                        if(course_status != "secondary"){
                          course_status = course_status + " disabled";
                          disable_course = true;
                        }
                      };

                      return (
                        <label key={i} className={`btn btn-${course_status} ${i==firstAvailableIndex ? 'active' : ''}`}
                          onClick={this.props.updatePrice}
                          data-value={e.id} data-index={handle.props.flightInfo.index} data-target={`${course_name}_course_id`}
                          value={e.id}
                        >
                          <input type="radio" name={`flight[${handle.props.flightInfo.id}][courses][${course_name}_course]`}
                            disabled={disable_course} value={e.id} defaultChecked={i==firstAvailableIndex} />
                          {e.name}
                        </label>
                      );
                    })
                  }
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );

  }
});

module.exports = CourseSelection;
