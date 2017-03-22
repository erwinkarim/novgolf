/*
  if a modal has data-type slick, it will try to put a slick js slider on the modal it self.
  recommended structure:-

  .modal#slick-modal{data:{type:'slick'}}
    .modal-dialog.min-w-90.m-0.mx-auto
      .modal-body.p-0#slick-modal-content
        - photos.each do |photo|
          %img{src: photo.avatar.url, data:{dismiss:'modal'}, style:'max-height:100vh;'}
*/

$(document).ready(function(){
  $('.modal[data-type="slick"]').on('shown.bs.modal', function(e){
    $('#slick-modal-content').slick();
    var slideIndex = parseInt(e.relatedTarget.dataset.index) || 0;
    $('#slick-modal-content').slick('slickGoTo', slideIndex);
  }).on('hide.bs.modal', function(e){
    $('#slick-modal-content').slick('unslick');
  })
});
