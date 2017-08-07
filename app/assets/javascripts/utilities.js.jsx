//change from float to currency format
//negative format should be (RMXX.XX)
var toCurrency = function(digits){
  var display = "";

  if(digits >= 0){
    display = "RM" + parseFloat(digits).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
  } else {
    display = "(RM" + (-1 * parseFloat(digits)).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ")";
  };
  return display;
};

var randomID = function(){
  return Math.floor(Math.random()*16777215).toString(16);
};

//group by an array by it's key
// copied from https://stackoverflow.com/questions/14446511/what-is-the-most-efficient-method-to-groupby-on-a-javascript-array-of-objects
var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

/*
for some fucking reason, this doesn't compile in production
now i know because this is not jsx
var arrayFromRange = function(startNumber,endNumber){
  return Array.from(Array(endNumber-startNumber+1),(v,k) => k + startNumber);
};
*/
var arrayFromRange = function(startNumber, endNumber){
  var test = [];

  for(var i = startNumber; i < endNumber + 1; i++){
      test.push(i);
  }

  return test;
}

var toTitleCase = function(inputStr){
  return inputStr.replace(/\w\S*/g, function(txt){
    //shoud ignore ALLCAPS in-case it's an acrynm
    if(txt === txt.toUpperCase()){
      return txt;
    };

    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

//get initials of a word
var toInitials = function(inputStr){
  var initials = inputStr.match(/\b\w/g) || [];
  return initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
};

var getDayOfWeek = function(n){
  var weekday = new Array(7);
  weekday[0] =  "Sunday";
  weekday[1] = "Monday";
  weekday[2] = "Tuesday";
  weekday[3] = "Wednesday";
  weekday[4] = "Thursday";
  weekday[5] = "Friday";
  weekday[6] = "Saturday";

  return weekday[n];
};

var getDayOfWeekISO = function(n){
  var weekday = new Array(7);
  weekday[0] = 'SU';
  weekday[1] = 'MO';
  weekday[2] = 'TU';
  weekday[3] = 'WE';
  weekday[4] = 'TH';
  weekday[5] = 'FR';
  weekday[6] = 'SA';

  return weekday[n];
}

var toISODate = function(n){
  return `${n.getFullYear()}${pad(n.getMonth()+1)}${pad(n.getDate())}`;
};

//return an array of date objects for each start and end date
var dateRange = function(start_date, end_date){

  var dates = [];
  //verify all the dates
  if(!Object.prototype.toString.call(start_date).includes('Date') || !Object.prototype.toString.call(end_date).includes('Date')){
    console.log('not a date object');
    return dates;
  }

  if(start_date > end_date){
    console.log('start date is earlier than end date');
    return dates;
  }

  //now cycle through the date giving each one day
  var counter = start_date;
  var end_date = new Date(end_date.valueOf() + 86400000);
  while(counter < end_date){
    //dates.push(`${counter.getFullYear()}-${pad(counter.getMonth()+1)}-${pad(counter.getDate())}`);
    dates.push(counter);
    counter = new Date(counter.valueOf() + 86400000);
  }

  return dates;



}
//pad the number 0-9 to 01 to 09
var pad = function(n){
  return n < 10 ? '0'+n : n;
}
