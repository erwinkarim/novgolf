var React = require('react');
var CourseSelection = require('./CourseSelection');

var golfCardDefaultOptions = {
    GolfClubTimesShowPrices:true,
    displayCourseGroup:false
};

//content of each tab to show how many balls, insurance, etc being choosen for each flight
var ReserveFormPage = React.createClass({
  propTypes: {
    club: React.PropTypes.object,
    flightInfo:React.PropTypes.object,
    flight:React.PropTypes.object,
    available_courses: React.PropTypes.array,
    isActive: React.PropTypes.bool,
    options: React.PropTypes.object,
    displayAs: React.PropTypes.oneOf(['card', 'flushed-list']),
    taxSchedule: React.PropTypes.object
  },
  getInitialState: function(){
    return {
      random_id:randomID(),
      courseSelectionAdminMode:React.PropTypes.bool
    };
  },
  getDefaultProps: function(){
    return { options: golfCardDefaultOptions, displayAs:'card', taxSchedule:{rate:0.06}, courseSelectionAdminMode:false};

  },
  rawNote: function(){
    md = new Remarkable();
    //return null;
    return { __html: md.render(this.props.flight.prices.note) };
  },
  tax_amount: function(){
    var pax_amount = parseFloat(this.props.flight.prices.flight) * this.props.flightInfo.pax;
    var caddy_amount = parseFloat(this.props.flight.prices.caddy) * this.props.flightInfo.caddy;
    var buggy_amount = parseFloat(this.props.flight.prices.cart) * this.props.flightInfo.buggy;
    var insurance_amount = parseFloat(this.props.flight.prices.insurance) * this.props.flightInfo.insurance;

    var taxation  = (pax_amount + caddy_amount + buggy_amount + insurance_amount) * parseFloat(this.props.taxSchedule.rate);
    return taxation;
  },
  render: function(){
    var activeClass = (this.props.isActive) ? "active" : "";

    var notesContent = (
      <div>
        <p className="mb-0">
          Notes
          <span> </span>
          <a href={`#notes-${this.state.random_id}`} data-toggle="collapse">
            <i className="fa fa-plus-square"></i>
          </a>
        </p>
        <div className="collapse" id={`notes-${this.state.random_id}`}>
          <div dangerouslySetInnerHTML={ this.rawNote()}></div>
          <p>Club T&C applies</p>
        </div>
      </div>
    );

    var formContentRow = [
      {caption:'Non-Members', value:'pax', price:'flight'},
      {caption:'Members', value:'member', price:'member'},
      {caption:'Buggy', value:'buggy', price:'cart'},
      {caption:'Caddy', value:'caddy', price:'caddy'},
      {caption:'Insurance', value:'insurance', price:'insurance'},
    ]

    //display the course selection component if user/admin has the right to do so
    var courseSelectionComponent = this.props.options.displayCourseGroup  ? (
      <CourseSelection courses={this.props.flight.course_data.courses}
        available_courses={this.props.available_courses}
        flightInfo={this.props.flightInfo} selectedCourse={this.props.selectedCourse}
        adminMode={this.props.courseSelectionAdminMode} updatePrice={this.props.updatePrice}/>
    ) : null;

    var formContent = (
      <div className="w-100">
        <input type="hidden" name={"flight[" + this.props.flightInfo.id + "][matrix_id]"} value={this.props.flight.matrix_id} />
        <input type="hidden" name={"flight[" + this.props.flightInfo.id + "][tee_time]"} value={this.props.flightInfo.teeTime} />
        <input type="hidden" name={"flight[" + this.props.flightInfo.id + "][second_tee_time]"} value={this.props.flightInfo.second_tee_time} />
        { formContentRow.map( (formContentElm, formContentIndex)=> {
          //for member max count is same as maxPax
          var bottomRange = 0;
          var topRange = 0;
          switch (formContentElm.value) {
            case "pax":
            case "member":
              topRange = this.props.flight.maxPax;
              break;
            case "buggy":
              bottomRange = this.props.flight.minCart;
              topRange = this.props.flight.maxCart;
              break;
            case "insurance":
              bottomRange = $.inArray(this.props.flight.prices.insurance_mode, [1,2]) != -1 ? this.props.flight.minPax : 0;
              topRange = this.props.flight.maxPax;
              break;
            default:
              bottomRange = this.props.flight[`min${toTitleCase(formContentElm.value)}`];
              topRange = this.props.flight[`max${toTitleCase(formContentElm.value)}`];
          };

          //for member, there's a link to members details
          var captionDisplay = ` x ${formContentElm.caption}`;
          if(formContentElm.value == "member"){
            captionDisplay = (this.props.options.displayMembersModal) ? (
              <a href="#membersModal" data-toggle="modal"> x Members</a>
            ) : " x Members";
          };

          //disable the select dropdown, mostly for insurnace
          var disabledSelect = (formContentElm.value == "insurance") ?
            (this.props.flight.prices.insurance_mode == 0 ? false : true) :
            false;

          //record insurance count covertly if the insurance mode is not optional
          var hiddenInsuranceCount = null;
          if(formContentElm.value == "insurance" && this.props.flight.prices.insurance_mode != 0){
            hiddenInsuranceCount = (
              <input type="hidden" name={`flight[${this.props.flightInfo.id}][count][${formContentElm.value}]`}
                value={this.props.flightInfo[formContentElm.value]}/>
            )
          }


          //set the pricing to zero for members field
          var elmPrice = this.props.flightInfo[formContentElm.value] * parseFloat(this.props.flight.prices[formContentElm.price]);
          if(formContentElm.value == "member"){ elmPrice = 0; }

          return (
            <div key={formContentIndex} className="form-group row mb-1">
              <input type="hidden" value={elmPrice} name={`flight[${this.props.flightInfo.id}][price][${formContentElm.value}]`} />
              { hiddenInsuranceCount }
              <div className="col-2">
                <select name={`flight[${this.props.flightInfo.id}][count][${formContentElm.value}]` } disabled={ disabledSelect}
                  onChange={this.props.updatePrice} value={this.props.flightInfo[formContentElm.value]}
                  data-index={this.props.flightInfo.index} data-target={formContentElm.value}>
                  { arrayFromRange(bottomRange, topRange).map( (e,i) => <option key={i}>{e}</option> )}
                </select>
              </div>
              <label className="col-5">{captionDisplay}</label>
              <label className="col-5">{toCurrency(elmPrice)} </label>
            </div>

          );
        })}

        <div className="form-group row mb-1">
           <label className="col-5 offset-2">Tax</label>
           <label className="col-5">
             {toCurrency(this.tax_amount())}
           </label>
         </div>
         { courseSelectionComponent}

      </div>
    );

    //display as a card or a list group items
    return this.props.displayAs == 'card' ? (
      <div className={`tab-pane card ${activeClass}`} id={`flight-tab-${this.props.flightInfo.id}`} >
        <div className="card-header text-right" style={ {color:'black'}}>
          <h5 className="mb-0">
            { this.props.flightInfo.teeTime }
            <span> | </span>
            <a href="#" data-filght-index={this.props.flightIndex} onClick={this.props.deleteFlight}>
              <i className="fa fa-close" data-flight-index={this.props.flightIndex}></i>
            </a>
          </h5>
        </div>
        <div className="card-block text-black pt-2 pb-2">
          { formContent }
          { notesContent }
        </div>
      </div>
    ) : (
      <div className="w-100">
        <li className="list-group-item p-0"></li>
        <li className="list-group-item">
          { formContent}
        </li>
        <li className="list-group-item">
          {notesContent}
        </li>
      </div>
    )
  }
});

module.exports = ReserveFormPage;
