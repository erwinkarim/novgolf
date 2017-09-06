var React = require('react');
var FlightFunctions = require('./FlightFunctions');

var CourseSelection = React.createClass({
  propTypes: {
    courses:React.PropTypes.array,
    available_courses: React.PropTypes.array,
    flightInfo:React.PropTypes.object,
    adminMode:React.PropTypes.bool,
    updatePrice: React.PropTypes.func,
    selectedCourse: React.PropTypes.number
  },
  getDefaultProps: ()=>{
    return {adminMode:false, updatePrice:()=>{return null;}, selectedCourse:0, available_courses:[]}
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
    /*
      Goal:
      * show by 1st and 2nd course of the flight
      * by default, show label, class is btn-secondary
      * if under maintaince or occupied it's will be a button in disabled state and respective
        class (warning or danger)
      * active state:
        normal: first available
        admin: if reservation is not null, courses that use the reservation_id
               if reservation is null, follow the selected course for first course, first available for 2nd course
    */
    return (
      <div>
        <hr />
        {["first","second"].map( (course_name,course_index) => {
            var tee_time = handle.props.flightInfo[`${course_name}_tee_time`] ;

            /*
              determin active status on courses.
              for admin mode, it's the one that is being selected in the
                course selection box at the top of the form (outside this component)
              for normal mode, it's the first available course
          var selectedReservationId = handle.props.courses[this.props.selectedCourse].first_reservation_id;
            */
            var first_available_course = () => {
              return handle.props.courses.indexOf(
                handle.props.courses.filter( (e) => {
                  return e[`${course_name}_reservation_id`] == null && handle.props.available_courses.includes(e.id);
                })[0]
              );

            };

            var active_index = handle.props.adminMode ? (
              handle.props.courses[handle.props.selectedCourse].first_reservation_id == null ? (
                //select the same course for 1st, first available for 2nd
                course_name == 'first' ? handle.props.selectedCourse : ( first_available_course() )
              ) : (
                //select the courses which corresponse to the reservation_id
                handle.props.courses.indexOf(
                  handle.props.courses.filter( (e) => {
                    return e[`${course_name}_reservation_id`] == handle.props.courses[handle.props.selectedCourse].first_reservation_id
                  })[0]
                )
              )
            ) : (
              //select first available_course
              first_available_course()
            );

            return (
              <div key={course_index} className="form-group row mb-1">
                <label className="col-12">{`${toTitleCase(course_name)} course (${tee_time}):`}</label>
                <div className="col-12">
                  <div className="btn-group flex-wrap" data-toggle="buttons" ref={(input)=>{this[`${course_name}_btn_group`] = input;}}>{
                    handle.props.courses.map( (course, c_index) => {
                      //get reservation status
                      var course_status = FlightFunctions.reserveColor(course[`${course_name}_reservation_status`]);
                      var active_status = (active_index == c_index) ?
                        (handle.props.adminMode ? 'active highlight-box' : 'active' ) : '';

                      //if course status is unavailable due to maintenance or being book, return button w/ appropiate class
                      if(!handle.props.available_courses.includes(course.id) || course_status != 'secondary'){
                        return (
                          <button key={c_index} disabled="disabled" className={`btn btn-outline-${course_status} ${active_status} disable h-38px`}>
                            {course.name}
                          </button>
                        );
                      };

                      //default, return label, not special classes
                      return (
                        <label key={c_index} className={`btn btn-outline-secondary ${active_status} h-38px`}
                          onClick={handle.props.updatePrice}
                          data-value={course.id} data-index={handle.props.flightInfo.index} data-target={`${course_name}_course_id`}
                          value={course.id}
                        >
                          <input type="radio" name={`flight[${handle.props.flightInfo.id}][courses][${course_name}_course]`}
                            value={course.id} defaultChecked={c_index == active_index} />
                          {course.name}
                        </label>

                      );
                    })
                  }</div>
                </div>
              </div>
            )
          })
        }
      </div>
    )
  }
});

module.exports = CourseSelection;
