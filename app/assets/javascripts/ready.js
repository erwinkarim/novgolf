var ready = function(){
  //convert flash messages into snackbar
  $.each( flashMessages, function(key, value){
    $.snackbar({content: value, style: key, timeout: 10000});
  });

  //featherlight gallery caption
  $.featherlightGallery.prototype.afterContent = function() {
    var caption = this.$currentTarget[0].dataset.caption;
    var handle = this;
    this.$legend = this.$legend || $('<div class="legend"/>').insertAfter(this.$content);
    this.$legend.text(caption);

    /*
      add click event on the picture to hide the caption
    */
    this.$content.click(function(){ handle.$legend.toggle(); });

    /*
    this.$instance.find('.caption').remove();
    $('<div class="caption">').text(caption).appendTo(this.$instance.find('.featherlight-content'));
    */
  };

};

$(document).ready(ready);
$(document).on('page:load', ready);
