// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery-ui/datepicker
//= require jquery.timepicker.js
//= require jquery_ujs
//= require paloma
//= require turbolinks
//= require react
//= require react_ujs
//= require fluxxor
//= require components
//= require_tree .

$(document).ready(function(){
    $('.datepicker').each(function(){
        $(this).datepicker({ minDate:0, dateFormat:'dd/mm/yy' });
    });
    $('.timepicker').each(function(){
        $(this).timepicker({ disableTextInput:'true'});
    });

    $('.timepicker-query').each(function(){
        $(this).timepicker({ disableTextInput:'true', minTime:'6:00am', maxTime:'11:00pm', timeFormat:'H:i'});
    });
});

var load_main = function(target){
  $.get(target.attr('data-source'), null, function(data){
      target.empty().append(data).ready( function(){
        target.find('.collapse').each(function(index){
          setup_collapse($(this));
        });
      });
  });
};

var setup_collapse = function(target, div_target){
  $(target).on('shown.bs.collapse', function(){
    if (target.attr('data-plsload') == 'yes' ){
      if( typeof div_target == "undefined"){
          var load_target = target;
      } else {
          var load_target = div_target;
      }
      $.get( $(target).attr('data-source'), null, function(data){
          $(load_target).empty().append(data).ready(function(){
            //setup collapse if detected
            $(load_target).find('.collapse').each( function(){
              if($(this).attr('data-load-target') == null){
                setup_collapse($(this));
              } else {
                setup_collapse($(this), $(this).attr('data-load-target'));
              }
            });
            $(target).attr('data-plsload', 'no');
          });
      });
    };
  });
};

var toCurrency = function(digits){
  return "MYR " + parseFloat(digits).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
};
