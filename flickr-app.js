var app = new Vue({
  el: '#container',
  data: {
    photos: [],
    tags: ["safe"]
  },
  updated: function() {
    setLazyloadListeners();
  },
  methods: {
    loadData: function() {
      var tag = document.createElement("script");
      tag.src="https://api.flickr.com/services/feeds/photos_public.gne?format=json&tags=" + app.tags.join(",");
      document.querySelector("head").appendChild(tag);
    },
    // Formats a string like "nobody@flickr.com (\"fuba_recorder\")" to retrieve the author only
    formatAuthor: function(str) {
      return str.substring(
        str.lastIndexOf("(\"") + 2,
        str.lastIndexOf("\")")
      );
    },
    formatTags: function(str) {
      return "#" + str.replace(/[ ]/g, " #");
    },
    retrieveAuthorUrl: function(str) {
      return "https://www.flickr.com/people/" + str;
    },
    search: function(str) {
      app.tags = ["safe", str];
      app.photos = [];
      app.loadData();
    }
  }
});

// The result from the API accesses this function, which creates an array of unique photos
function jsonFlickrFeed(feed) {
  // Creates an array of links from the link key-value pair of photos already on the page
  var linkArray = app.photos.map(function(photo) {
    return photo.link;
  });

  // Returns only photos that aren't on the page already from the API
  var newPhotos = feed.items.filter(function(item) {return linkArray.indexOf(item.link) === -1});
  // Adds new photos to the page
  app.photos = app.photos.concat(newPhotos);
}

window.onscroll = function() {
  // Calculates when the user has scrolled near the bottom of the window, then loads more photos
  let bottomOfWindow = document.documentElement.scrollTop + window.innerHeight >= document.documentElement.offsetHeight - 20;
  if (bottomOfWindow) {
    app.loadData();
  }
};

// Lazy loading code from: https://css-tricks.com/the-complete-guide-to-lazy-loading-images/
// Used Method 1 as spec required IE 10+ support and Intersection Observer is not supported
setLazyloadListeners = function() {
  var lazyloadImages = document.querySelectorAll("img.lazy");
  var lazyloadThrottleTimeout;

  function lazyload() {
    if(lazyloadThrottleTimeout) {
      clearTimeout(lazyloadThrottleTimeout);
    }

    lazyloadThrottleTimeout = setTimeout(function() {
      var scrollTop = window.pageYOffset;
      for (var i=0; i < lazyloadImages.length; i++) {
        var img = lazyloadImages[i];
        if(img.offsetTop < (window.innerHeight + scrollTop)) {
          img.src = img.dataset.src;
          img.classList.remove('lazy');
        }
      }
      if(lazyloadImages.length === 0) {
        document.removeEventListener("scroll", lazyload);
        window.removeEventListener("resize", lazyload);
        window.removeEventListener("orientationchange", lazyload);
      }
    }, 20);
  }

  document.addEventListener("scroll", lazyload);
  window.addEventListener("resize", lazyload);
  window.addEventListener("orientationChange", lazyload);
  lazyload();
};

document.getElementById("load-images").addEventListener("click", function() {
  app.loadData();
});

document.getElementById("search").addEventListener("keyup", function(event) {
  if (event.key === "Enter") {
    app.search(event.target.value);
  }
})

//Moves image data into app.photos, out of the JSONFlickrFeed wrapping using JSONP
app.loadData();

