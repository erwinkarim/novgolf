var toCurrency = function(digits){
  return "MYR " + parseFloat(digits).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
};

var randomID = function(){
  return Math.floor(Math.random()*16777215).toString(16);
};

var arrayFromRange = function(startNumber,endNumber){
  return Array.from(Array(endNumber-startNumber+1),(v,k) => k + startNumber);
};
