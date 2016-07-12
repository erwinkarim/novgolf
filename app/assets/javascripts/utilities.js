var toCurrency = function(digits){
  return "MYR " + parseFloat(digits).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
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
