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
//= require turbolinks
//= require remarkable.min.js
//= require featherlight
//= require featherlight-gallery
//= require snackbar
//= require jquery-fileupload/basic-plus
//= require utilities
//= require react
//= require react_ujs
//= require components
//= require_tree .

var ready = function(){
  //convert flash messages into snackbar
  $.each( flashMessages, function(key, value){
    $.snackbar({content: value, style: key, timeout: 10000});
  });

  //featherlight gallery caption
  $.featherlightGallery.prototype.afterContent = function() {
    console.log("$currentTarget", this.$currentTarget[0].dataset.caption);
    var caption = this.$currentTarget[0].dataset.caption;
    this.$legend = this.$legend || $('<div class="legend"/>').insertAfter(this.$content);
    this.$legend.text(caption);
    /*
    this.$instance.find('.caption').remove();
    $('<div class="caption">').text(caption).appendTo(this.$instance.find('.featherlight-content'));
    */
  };

};

$(document).ready(ready);
$(document).on('page:load', ready);
