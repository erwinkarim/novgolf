
//setup photoswipe gallery when .photo-swipe-gallery calss detected

$(document).ready(function(){
  var initPhotoSwipeFromDOM = function(gallerySelector){
    var onThumbnailsClick = function(e){
      //prevent default stuff
      e = e || window.event;
      e.preventDefault ? e.preventDefault() : e.returnValue = false;

      //get the root of the elements
      var gallery = $(e.target).closest(gallerySelector);

      //reconstruct the array of object and open photoswipe on that item
      var object_array = gallery.find('a').map((i,e) => {
        var obj = Object.assign({});
        var size = e.dataset.size.split('x');
        obj.w = size[0];
        obj.h = size[1];
        obj.src = e.getAttribute('href');
        obj.title = e.dataset.title;

        return obj;
      });

      initPS(object_array,e.target.dataset.index );

    };

    var initPS = function(object_array, selected_index){
      var pswpElement = document.querySelectorAll('.pswp')[0];
      var options = {index:parseInt(selected_index)};

      var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, object_array, options);
      gallery.init();

    };

    // loop through all gallery elements and bind events
    var galleryElements = document.querySelectorAll( gallerySelector );

    for(var i = 0, l = galleryElements.length; i < l; i++) {
      galleryElements[i].setAttribute('data-pswp-uid', i+1);
      galleryElements[i].onclick = onThumbnailsClick;
    }
  }

  // execute above photo-swipe-gallery');
  initPhotoSwipeFromDOM('.photo-swipe-gallery');

  //link to launch photo gallery
  //a tag much have data-toggle=photo-swipe-gallery and the href points to a .photo-swipe-gallery
  $('a[data-toggle="photo-swipe-gallery"]').on('click', function(e){
    e.preventDefault();

    var target = e.currentTarget.attributes.href.nodeValue;

    //find the target and click the first link there
    $(target).find('a:first').click();
  })

  $('button[data-toggle="photo-swipe-gallery"]').on('click', function(e){
    e.preventDefault();

    //find the target the click the first link ther
  })
});
