var ready = function(){
  //convert flash messages into snackbar
  $.each( flashMessages, function(key, value){
    $.snackbar({content: value, style: key, timeout: 10000});
  });
};

$(document).ready(ready);
$(document).on('page:load', ready);
