/*
  get the e, the trigger, flightInfo (current state of choose flight) and flight (flight min and max) and update the counts appropiately
  * e must have dataset values {target: info that will be changed, value: the new value}
  * will update the member + pax count to be between flight.minPax and flight.maxPax
  * will update the insurnace count to member + pax if the insurance is inclusive
  * return the updated flightInfo
*/
class FlightFunctions {
  static updateCount(e, flightInfo, flight){
    /*
      get the e, the trigger, flightInfo (current state of choose flight) and flight (flight min and max) and update the counts appropiately
      * e must have dataset values {target: info that will be changed, value: the new value}
      * will update the member + pax count to be between flight.minPax and flight.maxPax
      * will update the insurnace count to member + pax if the insurance is inclusive
      * return the updated flightInfo
    */
    //console.log(e.target.dataset.target, e.target.value);
    flightInfo[e.target.dataset.target] = parseInt(e.target.value);

    if(e.target.dataset.target == "pax" || e.target.dataset.target == "member"){
      //get the min/max pax
      var minPax = flight.minPax;
      var maxPax = flight.maxPax;

      switch (e.target.dataset.target) {
        case "pax":
          //if less than min pax, reset ball count to (minPax - member)
          //if more than max pax, reset member count to be at (maxPax - paxCount)
          if(flightInfo.member + flightInfo.pax < minPax){
            flightInfo.pax = minPax - flightInfo.member;
          }
          if(flightInfo.member + flightInfo.pax > maxPax){
            flightInfo.member = maxPax - flightInfo.pax;
          }
          break;
        case "member":
          //if less than min pax, reset balls to (minpax - member)
          //if more than max pax, reset balls count to be at (maxPax - member)
          if(flightInfo.member + flightInfo.pax < minPax){
            flightInfo.pax = minPax - flightInfo.member;
          }
          if(flightInfo.member + flightInfo.pax > maxPax){
            flightInfo.pax = maxPax - flightInfo.member;
          }
        break;
        default:
      }

      //push empty members data if members.length < member
      if('members' in flightInfo && flightInfo.member > flightInfo.members.length){
        //console.log("pushing dummy into members");
        for(var n of arrayFromRange(flightInfo.members.length + 1, flightInfo.member)){
          flightInfo.members.push({name:'AutoName', member_id:'AutoID'});
        };
      };

      //delete members data if members.length > member
      if('members' in flightInfo && flightInfo.member < flightInfo.members.length){
        var amount_deleted = flightInfo.members.length - flightInfo.member;
        flightInfo.members.splice(flightInfo.members.length - amount_deleted, amount_deleted);
      };
    }

    //sanity check, ensure that insurance <= member+pax
    if(flightInfo.insurance > flightInfo.member + flightInfo.pax){
      flightInfo.insurance = flightInfo.member + flightInfo.pax;
    }
    //update the insurance count automatically if insurance mode is madatory
    if(($.inArray(flight.prices.insurance_mode,[1,2]) != -1) &&
      (e.target.dataset.target == 'pax' || e.target.dataset.target == 'member') ){
        flightInfo.insurance = flightInfo.member + flightInfo.pax;
    }

    //return update flightInfo
    return flightInfo

  }
  static updateTotals(flightInfos, flights, club){
    //get the flightInfo totals, returns an object with {total:X, tax:X, grand_total:x}
    var newTotalPrice = 0;
    flightInfos.map( (e,i) => {
      newTotalPrice += (
        e.pax * parseFloat(flights[e.flightIndex].prices.flight) +
        e.buggy * parseFloat(flights[e.flightIndex].prices.cart) +
        e.caddy * parseFloat(flights[e.flightIndex].prices.caddy) +
        e.insurance * parseFloat(flights[e.flightIndex].prices.insurance)
      )
    });

    var newTax = newTotalPrice * club.tax_schedule.rate;

    return {total:newTotalPrice, tax: newTax, grand_total:newTax + newTotalPrice};

  }
  static reserveColor(status){
    //return the reserve color
    var reserve_status = "secondary"
    switch ( status ){
      case 1: reserve_status = "warning"; break;
      case 2: reserve_status = "danger"; break;
      case 3: reserve_status = "danger"; break;
      case 8: reserve_status = "info"; break;
      default: true;
    }

    return reserve_status;
  }
};

module.exports = FlightFunctions;
