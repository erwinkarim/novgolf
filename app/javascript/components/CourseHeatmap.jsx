import React, {PropTypes} from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import {RRule, RRuleSet,rrulestr} from 'rrule';

/*
  display the course Availability heatmap based on each course.course_settings data
*/


class CourseHeatmap extends React.Component {
  constructor(props){
    super(props);
    this.state = {date_values:[]};
    this.state = { date_values:this.updateCalendar(this.props)};
    //this.updateCalendar(this.props);
  }
  updateCalendar(props){
    if(props.courses == null){
      console.log('courses is null');
      return [];
    }

    /*
      plan:-
        create a empty array of dates from here to next 180 days
        go through each rule and add count+1 and msg to each date
        update the datevlaue as the new date value
    */
    var dateValues = dateRange(new Date(Date.now()), new Date(Date.now() + 15552000000) ).map( (this_date, d_index) => {
      return { date:this_date, count:0}
    });


    props.courses.map( (course, c_index) => {
      course.course_settings.map( (cs, cs_index) => {
        //translate from course_setting_property_id to rrule
        //match the dates and {count += 1, message.push( course N is closed ) }
        rrulestr(
          cs.course_setting_property_id == 1 ? `FREQ=WEEKLY;WKST=MO;BYDAY=${getDayOfWeekISO(cs.value_int)}` :
          cs.course_setting_property_id == 2 ? `FREQ=WEEKLY;WKST=MO;BYMONTHDAY=${cs.value_int}` :
          cs.course_setting_property_id == 3 ? `FREQ=MONTHLY;WKST=MO;BYDAY=${getDayOfWeekISO(JSON.parse(cs.value_string).day)};BYSETPOS=${JSON.parse(cs.value_string).week}` :
          cs.course_setting_property_id == 4 ? `FREQ=DAILY;DTSTART=${toISODate(new Date(cs.value_min))}T080100Z;UNTIL=${toISODate(new Date(cs.value_max))}T080100Z;WKST=MO` :
          null
        ).between( new Date(Date.now()), new Date(Date.now() + 15552000000 )).map( (selected_date, date_i) => {
          dateValues.find( (e) => { return e.date.toDateString() == selected_date.toDateString()}).count += 1;
        });
      });
    });

    //this.setState({date_values:dateValues});
    return dateValues;

  }
  componentWillReceiveProps(nextProps){
    console.log('update calendar from new props');
    this.setState({date_values:this.updateCalendar(nextProps)});
    //this.updateCalendar(nextProps);
  }
  componentDidUpdate(){
    //a bit slower, but works
    this.updateTooltip();

    //console.log('$r.heatmap', $(this.heatMap).find('[data-toggle="tooltip"]')) ;
    /*
    $(this.heatMap).find('[data-toggle="tooltip"]').map( (e,i) => {
      $(e).tooltip('hide').attr('data-original-title', $(e).attr('title')).tooltip('fixTitle').tooltip('show');
    });
    */
  }
  componentDidMount(){
    this.updateTooltip();
  }
  updateTooltip(){
    $(this.heatMap).find('[data-toggle="tooltip"]').tooltip('dispose').tooltip({
      delay:{ "show": 500, "hide": 100 }
    });

  }
  render(){
    if(this.props.courses == null){
      return (<div>No course data ...</div>)
    };

    var handle = this;

    /*
        titleForValue={ (value) => { return value.count == 0 ? `Open on ${value.date.toDateString()}` : `Closed on ${value.date.toDateString()} by ${value.count} policy(ies)`; }}
    */
    return (
      <div ref={(calendar) => { this.heatMap=calendar;}}>
        <CalendarHeatmap
          endDate={new Date(Date.now() + 15552000000)} numDays={180}
          values={ handle.state.date_values }
          classForValue={ (value) => { return !value ? `color-github-1` : value.count == 0 ? `color-github-1` : value.count > 4 ? `color-red-4` :`color-red-${value.count}`; } }
          titleForValue={ (value) => { return !value ? `Course is open` : value.count == 0 ? `Open on ${value.date.toDateString()}` : `Closed on ${value.date.toDateString()} by ${value.count} policy(ies)`; }}
          tooltipDataAttrs={ {'data-toggle':'tooltip'} }
          />
      </div>
    );
  }
}

CourseHeatmap.propTypes = {
    courses:React.PropTypes.array
};

export default CourseHeatmap;
