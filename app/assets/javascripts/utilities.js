var toCurrency = function(digits){
  return "RM " + parseFloat(digits).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
};

var randomID = function(){
  return Math.floor(Math.random()*16777215).toString(16);
};

/*
for some fucking reason, this doesn't compile in production
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
  return inputStr.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
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

//pad the number 0-9 to 01 to 09
var pad = function(n){
  return n < 10 ? '0'+n : n;
}
