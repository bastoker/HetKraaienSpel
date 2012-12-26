/**
 * @file
 *   Provides helpful utilities for common Canvas operations.
 */

// The App object holds utilities that are usually unnecessary to use directly.
var App = {};
App.debugMode = false;
App.Debug = {};
App.Debug.updateTimeElapsed = 0;
App.Debug.clearTimeElapsed = 0;
App.Debug.drawTimeElapsed = 0;

// SETUP ----------------------------------------------------------------------

/**
 * Global environment.
 */
var canvas, $canvas, context, world;

/**
 * Current position of the mouse coordinates relative to the canvas.
 */
var mouse = {
    coords: {x: 9999, y: 9999},
};

// Indicates whether the canvas is animating or focused.
App._animate = false, App._blurred = false;

// Set up important activities.
jQuery(document).ready(function() {
  // Set up the canvas.
  canvas = document.getElementById('canvas');
  $canvas = jQuery(canvas);
  App.setDefaultCanvasSize();

  // Set up the main graphics context.
  context = canvas.getContext('2d');

  // Set up the world.
  // Lots of drawing depends on the world size, so set this before anything else
  // and try not to change it.
  world = new World();

  // Track the mouse.
  $canvas.hover(function() {
    var $this = jQuery(this);
    $this.on('mousemove.coords, touchmove.coords', function(e) {
      if (e.type == 'touchmove') {
        // Prevent window scrolling on iPhone and display freeze on Android
        e.preventDefault();
      }
      mouse.coords = {
          x: e.pageX - $this.offset().left,
          y: e.pageY - $this.offset().top,
      };
    });
  }, function() {
    jQuery(this).off('.coords');
    mouse.coords = {x: -9999, y: -9999};
  });

  // Track and delegate click events.
  $canvas.on('mousedown mouseup click touchstart touchend', function(e) {
    App.Events.trigger(e.type, e);
  });

  // Keep track of time, but don't start the timer until we start animating.
  App.timer = new Timer(false);
  App.timer.frames = 0; // The number of frames that have been painted.
});

// Set up the app itself. This runs after main.js loads.
jQuery(window).load(function() {
  // Prevent default behavior of these keys because we'll be using them and
  // they can cause other page behavior (like scrolling).
  for (var dir in keys) {
    if (keys.hasOwnProperty(dir)) {
      App.preventDefaultKeyEvents(keys[dir].join(' '));
    }
  }

  // Pre-load images and start the animation.
  Caches.preloadImages(typeof preloadables === 'undefined' ? [] : preloadables, {
    finishCallback: function() {
      // Expose utilities globally if they are not already defined.
      if (typeof Events === 'undefined') {
        Events = App.Events;
      }
      if (typeof Utils === 'undefined') {
        Utils = App.Utils;
      }

      // Run the developer's setup code.
      var start = setup(false);

      // Start animating!
      if (start !== false) {
        startAnimating();
      }

      // Announce that we've started. Responding to this event could be useful
      // for stopping animation (for example, if the user needs to press a
      // "start" button first) or for running some kind of intro graphics.
      jQuery(document).trigger('start');
    },
  });
});

/**
 * Sets the default size of the canvas as early as possible.
 *
 * This function is magic-named and can be overridden for alternate behavior.
 */
App.setDefaultCanvasSize = function() {
  // Do not resize if data-resize is false (fall back to CSS).
  if ($canvas.attr('data-resize') == 'false') {
    return;
  }
  var $window = jQuery(window);
  // If requested, make the canvas the size of the browser window.
  if ($canvas.attr('data-resize') == 'full') {
    canvas.width = $window.innerWidth();
    canvas.height = $window.height() -
        (jQuery('header').outerHeight() || 0) -
        (jQuery('footer').outerHeight() || 0);
  }
  // Use the following properties to determine canvas size automatically:
  // width, height, data-minwidth, data-maxwidth, data-minheight, data-maxheight
  // If the width and height are not explicitly specified, the canvas is
  // resized to the largest size that fits within the max and the window, with
  // a minimum of min.
  else {
    var maxWidth = $canvas.attr('data-maxwidth') || canvas.width;
    var minWidth = $canvas.attr('data-minwidth') || canvas.width;
    canvas.width = Math.min(maxWidth, Math.max($window.width(), minWidth));
    var maxHeight = $canvas.attr('data-maxheight') || canvas.height;
    var minHeight = $canvas.attr('data-minheight') || canvas.height;
    canvas.height = Math.min(maxHeight, Math.max($window.height(), minHeight));
  }
  var aspectRatio = $canvas.attr('data-aspectratio') || 0;
  if (aspectRatio) {
    if (aspectRatio.indexOf(':') == -1) {
      aspectRatio = parseFloat(aspectRatio);
    }
    else {
      if (aspectRatio == '4:3') aspectRatio = 4/3;
      else if (aspectRatio == '16:9') aspectRatio = 16/9;
      else if (aspectRatio == '16:10' || aspectRatio == '8:5') aspectRatio = 1.6;
    }
    if (canvas.width < canvas.height * aspectRatio) {
      canvas.height = Math.floor(canvas.width / aspectRatio);
    }
    else if (canvas.width > canvas.height * aspectRatio) {
      canvas.width = Math.floor(canvas.height * aspectRatio);
    }
  }
};

// CACHES ---------------------------------------------------------------------

/**
 * Tracks cached items.
 */
var Caches = {
    /**
     * A map from image file paths to Image objects.
     */
    images: {},
    /**
     * A map from image file paths to CanvasPattern objects.
     */
    imagePatterns: {},
    /**
     * Preload a list of images asynchronously.
     *
     * @param files
     *   An array of paths to images to preload.
     * @param options
     *   A map of options for this function.
     *   - finishCallback: A function to run when all images have finished
     *     loading. Receives the number of images loaded as a parameter.
     *   - itemCallback: A function to run when an image has finished loading.
     *     Receives the file path of the loaded image, how many images have
     *     been loaded so far (including the current one), and the total number
     *     of images to load.
     */
    preloadImages: function(files, options) {
      var l = files.length, m = -1, src, image;
      var notifyLoaded = function(itemCallback, src) {
        m++;
        if (typeof itemCallback == 'function') {
          itemCallback(src, m, l);
        }
        if (m == l && typeof options.finishCallback == 'function') {
          options.finishCallback(l);
        }
      };
      notifyLoaded();
      while (files.length) {
        src = files.pop();
        image = new Image();
        image.num = l-files.length;
        image._src = src;
        image.onload = function() {
          Caches.images[this._src] = this;
          notifyLoaded(options.itemCallback, this.src);
        }
        image.src = src;
      }
    },
};

// Override the Sprite caching mechanisms.
Sprite.getImageFromCache = function(src) {
  return Caches.images[src];
};
Sprite.saveImageToCache = function(src, image) {
  Caches.images[src] = image;
};
Sprite.preloadImages = Caches.preloadImages;

// EVENTS ---------------------------------------------------------------------

App._handlePointerBehavior = function() {
  return App.isHovered(this);
};

/**
 * An event system for canvas objects.
 */
App.Events = {
  _listeners: {},
  /**
   * Listen for a specific event.
   *
   * @see Box.listen()
   */
  listen: function(obj, eventName, callback, weight, once) {
    // Allow specifying multiple space-separated event names.
    var events = eventName.split(' ');
    if (events.length > 1) {
      for (var j = 0, l = events.length; j < l; j++) {
        App.Events.listen(obj, events[j], callback, weight, once);
      }
      return;
    }
    // Separate the event name from the namespace.
    var namespace = '', i = eventName.indexOf('.');
    if (i !== -1) {
      namespace = eventName.substring(i+1);
      eventName = eventName.substring(0, i);
    }
    // Add a listener for the relevant event.
    if (!App.Events._listeners[eventName]) {
      App.Events._listeners[eventName] = [];
    }
    App.Events._listeners[eventName].push({
      object: obj,
      callback: function() {
        callback.apply(obj, arguments);
      },
      namespace: namespace,
      weight: weight || 0,
      once: once || false,
    });
    // Return the listening object so that this function is chainable.
    return obj;
  },
  /**
   * Listen for a specific event and only react the first time it is triggered.
   *
   * @see Box.once()
   */
  once: function(obj, eventName, callback, weight) {
    return App.Events.listen(obj, eventName, callback, weight, true);
  },
  /**
   * Stop listening for a specific event.
   *
   * @see Box.unlisten()
   */
  unlisten: function(obj, eventName) {
    // Allow specifying multiple space-separated event names.
    var events = eventName.split(' ');
    if (events.length > 1) {
      for (var j = 0, l = events.length; j < l; j++) {
        App.Events.unlisten(obj, events[j]);
      }
      return;
    }
    // Separate the event name from the namespace.
    var namespace = '', i = eventName.indexOf('.'), e;
    if (i !== -1) {
      namespace = eventName.substring(i+1);
      eventName = eventName.substring(0, i);
    }
    // Remove all relevant listeners.
    if (App.Events._listeners[eventName]) {
      for (e = App.Events._listeners[eventName], i = e.length-1; i >= 0; i--) {
        if (e[i].object == obj && (!namespace || e[i].namespace == namespace)) {
          App.Events._listeners[eventName].splice(i, 1);
        }
      }
    }
    // Return the listening object so that this function is chainable.
    return obj;
  },
  /**
   * Trigger an event.
   *
   * @param eventName
   *   The name of the event to trigger, e.g. "click."
   * @param event
   *   An event object.
   * @param ...
   *   Additional arguments to pass to the relevant callbacks.
   */
  trigger: function() {
    var eventName = Array.prototype.shift.call(arguments);
    var e = App.Events._listeners[eventName]; // All listeners for this event
    if (e) {
      // Sort listeners by weight (lowest first).
      e.sort(function(a, b) {
        return a.weight - b.weight;
      });
      // Execute the callback for each listener for the relevant event.
      for (var i = e.length-1; i >= 0; i--) {
        if (!App.Events.Behaviors[eventName] ||
            App.Events.Behaviors[eventName].apply(e[i].object, arguments)) {
          e[i].callback.apply(e[i].object, arguments);
          // Remove listeners that should only be called once.
          if (e[i].once) {
            App.Events.unlisten(e[i].object, eventName + '.' + e[i].namespace);
          }
          // Stop processing overlapping objects if propagation is stopped.
          var event = Array.prototype.shift.call(arguments);
          if (event && event.isPropagationStopped()) {
            break;
          }
        }
      }
    }
  },
  /**
   * Determine whether an object should be triggered for a specific event.
   */
  Behaviors: {
    mousedown: App._handlePointerBehavior,
    mouseup: App._handlePointerBehavior,
    click: App._handlePointerBehavior,
    touchstart: App._handlePointerBehavior,
    touchend: App._handlePointerBehavior,
  },
};

// ANIMATION ------------------------------------------------------------------

// requestAnimFrame shim for smooth animation
window.requestAnimFrame = (function(callback){
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback){
        window.setTimeout(callback, 1000 / 60);
    };
})();

/**
 * Start animating the canvas.
 * 
 * @see stopAnimating()
 */
function startAnimating() {
  if (!App._animate) {
    App._animate = true;
    App.timer.start();
    App.animate();
  }
}

/**
 * Stop animating the canvas.
 * 
 * @see startAnimating()
 */
function stopAnimating() {
  App._animate = false;
  App.timer.stop();

  // Output performance statistics.
  if (App.debugMode && console && console.log) {
    var elapsed = App.timer.getElapsedTime(), frames = App.timer.frames, d = App.Debug;
    var sum = d.updateTimeElapsed + d.clearTimeElapsed + d.drawTimeElapsed;
    console.log({
      'ms/frame': {
        update: d.updateTimeElapsed / frames,
        clear: d.clearTimeElapsed / frames,
        draw: d.drawTimeElapsed / frames,
        animOps: sum / frames,
        other: (elapsed - sum) / frames,
        animate: elapsed / frames,
      },
      percent: {
        update: d.updateTimeElapsed / elapsed * 100,
        clear: d.clearTimeElapsed / elapsed * 100,
        draw: d.drawTimeElapsed / elapsed * 100,
        animOps: sum / elapsed * 100,
        other: (elapsed - sum) / elapsed * 100,
      },
      fps: frames / elapsed,
    });
  }
}

/**
 * Animates the canvas. This is intended for private use and should not be
 * called directly. Instead see startAnimating() and stopAnimating().
 * 
 * @see startAnimating()
 * @see stopAnimating()
 */
App.animate = function() {
  // Record the amount of time since the last tick. Used to smooth animation.
  // This is the only place that App.timer.getDelta() should ever be called
  // because getDelta() returns the time since the last time it was called so
  // calling it elsewhere will skew the result here.
  App.timer.lastDelta = App.timer.getDelta();
  App.timer.frames++; // Count paints so we can calculate FPS

  var t = new Timer();

  // update
  mouse.scroll._update();
  update();

  if (App.debugMode) {
    App.Debug.updateTimeElapsed += t.getDelta();
  }

  // clear
  context.clear();

  if (App.debugMode) {
    App.Debug.clearTimeElapsed += t.getDelta();
  }

  // draw
  draw();

  if (App.debugMode) {
    App.Debug.drawTimeElapsed += t.getDelta();
  }

  // request new frame
  if (App._animate) {
    window.requestAnimFrame(App.animate);
  }
};

/**
 * Stops animating when the window (tab) goes out of focus.
 *
 * This is great because it stops running the CPU when we don't need it,
 * although it can lead to some weird behavior if you expect something to be
 * running in the background or if you have the browser still visible when you
 * switch to another program. If you don't want this behavior, you can toggle
 * it off like this:
 *
 * $(window).off('.animFocus');
 *
 * For much more comprehensive support for detecting and acting on page
 * visibility, use https://github.com/ai/visibility.js
 */
jQuery(window).on('focus.animFocus', function() {
  if (App._blurred) {
    App._blurred = false;
    startAnimating();
  }
});
jQuery(window).on('blur.animFocus', function() {
  stopAnimating();
  App._blurred = true;
});

// RENDERING ------------------------------------------------------------------

/**
 * Clear the canvas.
 * 
 * Passing the optional fillStyle parameter will cause the entire canvas to be
 * filled in with that style. Otherwise the canvas is simply wiped.
 */
CanvasRenderingContext2D.prototype.clear = function(fillStyle) {
  if (fillStyle) {
    this.fillStyle = fillStyle;
    this.fillRect(0, 0, world.width, world.height);
  }
  else {
    this.clearRect(world.xOffset, world.yOffset, this.canvas.width, this.canvas.height);
  }
};

// Store the original drawImage function so we can actually use it.
CanvasRenderingContext2D.prototype.__drawImage = CanvasRenderingContext2D.prototype.drawImage;
/**
 * Draws an image onto the canvas.
 *
 * This method is better than the original context.drawImage() for several
 * reasons:
 * - It uses a cache to allow images to be drawn immediately if they were
 *   pre-loaded and to store images that were not pre-loaded so that they can
 *   be drawn immediately later.
 * - It can draw Sprite, SpriteMap, and Layer objects as well as the usual
 *   images, videos, and canvases. (Note that when Layers are drawn using this
 *   method, their "relative" property IS taken into account.)
 * - It allows drawing an image by passing in the file path instead of an
 *   Image object.
 *
 * Additionally, this method has an optional "finished" parameter which is a
 * callback that runs when the image passed in the "src" parameter is finished
 * loading (or immediately if the image is already loaded or is a video). The
 * callback's context (its "this" object) is the canvas graphics object. Having
 * this callback is useful because if you do not pre-load images, the image
 * will not be loaded (and therefore will not be drawn) for at least the first
 * time that drawing it is attempted. You can use the finished callback to draw
 * the image after it has been loaded if you want.
 *
 * Apart from the additions above, this method works the same way as the
 * original in the spec. More details are available at
 * http://www.w3.org/TR/2dcontext/#drawing-images-to-the-canvas
 *
 * As a summary, this method can be invoked three ways:
 * - drawImage(src, x, y[, finished])
 * - drawImage(src, x, y, w, h[, finished])
 * - drawImage(src, sx, sy, sw, sh, x, y, w, h[, finished])
 *
 * In each case, the src parameter accepts one of the following:
 *   - The file path of an image to draw
 *   - A Sprite or SpriteMap object
 *   - A Layer object
 *   - An HTMLCanvasElement
 *   - An HTMLImageElement (same thing as an Image)
 *   - An HTMLVideoElement
 *
 * The x and y parameters indicate the coordinates of the canvas graphics
 * context at which to draw the top-left corner of the image. (Often this is
 * the number of pixels from the top-left corner of the canvas, though the
 * context can be larger than the canvas if the viewport has scrolled, e.g.
 * with context.translate().)
 *
 * The w and h parameters indicate the width and height of the image,
 * respectively. Defaults to the image width and height, respectively (or, for
 * a Sprite or SpriteMap, defaults to the projectedW and projectedH,
 * respectively).
 *
 * The sx, sy, sw, and sh parameters define a rectangle within the image that
 * will be drawn onto the canvas. sx and sy are the x- and y- coordinates
 * (within the image) of the upper-left corner of the source rectangle,
 * respectively, and sw and sh are the width and height of the source
 * rectangle, respectively. These parameters are ignored when drawing a Sprite
 * or SpriteMap. The W3C provides a helpful image to understand these
 * parameters at http://www.w3.org/TR/2dcontext/images/drawImage.png
 *
 * @see drawPattern()
 * @see Caches.preloadImages()
 */
CanvasRenderingContext2D.prototype.drawImage = function(src, sx, sy, sw, sh, x, y, w, h, finished) {
  // Allow the finished parameter to come last,
  // regardless of how many parameters there are.
  if (arguments.length % 2 === 0) {
    finished = Array.prototype.pop.call(arguments);
    // Don't let finished interfere with other arguments.
    if (sw instanceof Function) sw = undefined;
    else if (x instanceof Function) x = undefined;
    else if (w instanceof Function) w = undefined;
    if (typeof finished != 'function') {
      finished = undefined;
    }
  }
  var t = this, a = arguments;
  // Keep the stupid order of parameters specified by the W3C.
  // It doesn't matter that we're not providing the correct default values;
  // those will be implemented by the original __drawImage() later.
  if (typeof x != 'number' && typeof y === 'undefined' &&
      typeof w != 'number' && typeof h === 'undefined') {
    x = sx, y = sy;
    if (typeof sw == 'number' && typeof sh !== 'undefined') {
      w = sw, h = sh;
    }
    sx = undefined, sy = undefined, sw = undefined, sh = undefined;
  }
  // Wrapper function for doing the actual drawing
  var _drawImage = function(image, x, y, w, h, sx, sy, sw, sh) {
    if (w && h) {
      if (sw && sh) {
        t.__drawImage(image, sx, sy, sw, sh, x, y, w, h);
      }
      else {
        t.__drawImage(image, x, y, w, h);
      }
    }
    else {
      t.__drawImage(image, x, y);
    }
    if (finished instanceof Function) {
      finished.call(t, a, true);
    }
  };
  if (src instanceof Sprite || src instanceof SpriteMap) { // draw a sprite
    src.draw(this, x, y, w, h);
    if (finished instanceof Function) {
      finished.call(t, a, true); // Sprite images are loaded on instantiation
    }
  }
  else if (src instanceof Layer) { // Draw the Layer's canvas
    t.save();
    t.globalAlpha = src.opacity;
    if (src.relative == 'canvas') {
      t.translate(world.xOffset, world.yOffset);
    }
    var f = finished;
    finished = undefined; // Don't call finished() until after translating back
    _drawImage(src.canvas, x, y, w, h, sx, sy, sw, sh);
    t.restore();
    finished = f;
    if (finished instanceof Function) {
      finished.call(t, a, true);
    }
  }
  else if (src instanceof HTMLCanvasElement || // draw a canvas
      src instanceof HTMLVideoElement) { // draw a video
    _drawImage(src, x, y, w, h, sx, sy, sw, sh);
  }
  else if (src instanceof HTMLImageElement || // draw an image directly
      src instanceof Image) { // same thing
    var image = src, src = image._src || image.src; // check for preloaded src
    if (!src) { // can't draw an empty image
      if (finished instanceof Function) {
        finished.call(t, a, false);
      }
      return;
    }
    if (!Caches.images[src]) { // cache the image by source
      Caches.images[src] = image;
    }
    if (image.complete || (image.width && image.height)) { // draw loaded images
      _drawImage(image, x, y, w, h, sx, sy, sw, sh);
    }
    else { // if the image is not loaded, don't draw it
      if (image._src) { // We've already tried to draw this one
        // The finished callback will run from the first time it was attempted to be drawn
        return;
      }
      var o = image.onload;
      image.onload = function() {
        if (typeof o == 'function') { // don't overwrite any existing handler
          o();
        }
        if (finished instanceof Function) {
          finished.call(t, a, false);
        }
      };
    }
  }
  else if (typeof src == 'string' && Caches.images[src]) { // cached image path
    var image = Caches.images[src];
    if (image.complete || (image.width && image.height)) { // Cached image is loaded
      _drawImage(image, x, y, w, h, sx, sy, sw, sh);
    }
    // If cached image is not loaded, bail; the finished callback will run
    // from the first time it was attempted to be drawn
  }
  else if (typeof src == 'string') { // uncached image path
    var image = new Image();
    image.onload = function() {
      if (finished instanceof Function) {
        finished.call(t, a, false);
      }
    };
    image._src = src;
    image.src = src;
    Caches.images[src] = image; // prevent loading an unloaded image multiple times
  }
  else {
    throw new TypeMismatchError('Image type not recognized.');
  }
};

/**
 * Draws a pattern onto the canvas.
 *
 * This function is preferred over createPattern() with fillRect() for drawing
 * patterns for several reasons:
 * - It uses a cache to allow images to be drawn immediately if they were
 *   pre-loaded and to store images that were not pre-loaded so that they can
 *   be drawn immediately later.
 * - It can draw Layer objects as well as the usual images, videos, and
 *   canvases. (Note that when Layers are drawn using this method, their
 *   "relative" property IS taken into account.)
 * - It allows drawing an image by passing in the file path instead of an
 *   Image object.
 *
 * Unlike our modified drawImage(), this method cannot draw Sprites or
 * SpriteMaps. If you need to draw a Sprite or SpriteMap as a pattern, draw the
 * part you want onto a Layer or a new canvas and then pass that as the src.
 *
 * @param src
 *   The image to draw as a pattern. Accepts one of the following types:
 *   - The file path of an image to draw
 *   - A Layer object
 *   - An HTMLCanvasElement
 *   - An HTMLImageElement (same thing as an Image)
 *   - An HTMLVideoElement
 *   - A CanvasPattern
 * @param x
 *   (Optional) The x-coordinate at which to draw the top-left corner of the
 *   pattern. Defaults to 0 (zero).
 * @param y
 *   (Optional) The y-coordinate at which to draw the top-left corner of the
 *   pattern. Defaults to 0 (zero).
 * @param w
 *   (Optional) The width of the pattern. Defaults to the canvas width.
 * @param h
 *   (Optional) The height of the pattern. Defaults to the canvas height.
 * @param rpt
 *   (Optional) The repeat pattern type. One of repeat, repeat-x, repeat-y,
 *   no-repeat. This parameter can be omitted even if a finished callback is
 *   passed, so the call drawPattern(src, x, y, w, h, finished) is legal.
 *   Defaults to repeat.
 * @param finished
 *   (Optional) A callback that runs when the image passed in the "src"
 *   parameter is finished loading (or immediately if the image is already
 *   loaded or is a video). The callback's context (its "this" object) is the
 *   canvas graphics object. Having this callback is useful because if you do
 *   not pre-load images, the image will not be loaded (and therefore will not
 *   be drawn) for at least the first time that drawing it is attempted. You
 *   can use the finished callback to draw the image after it has been loaded
 *   if you want.
 *
 * @return
 *   The CanvasPattern object for the pattern that was drawn, if possible; or
 *   undefined if a pattern could not be drawn (usually because the image
 *   specified for drawing had not yet been loaded). If your source parameter
 *   is anything other than an image or a file path, the image and pattern
 *   drawn cannot be cached, so it can be helpful for performance to store this
 *   return value and pass it in as the src parameter in the future if you need
 *   to draw the same pattern repeatedly. (Another option is to cache the
 *   drawn pattern in a Layer.)
 *
 * @see drawImage()
 * @see Caches.preloadImages()
 */
CanvasRenderingContext2D.prototype.drawPattern = function(src, x, y, w, h, rpt, finished) {
  if (typeof x === 'undefined') x = 0;
  if (typeof y === 'undefined') y = 0;
  if (typeof w === 'undefined') w = this.canvas.width;
  if (typeof h === 'undefined') h = this.canvas.height;
  if (typeof rpt == 'function') {
    finished = rpt;
    rpt = 'repeat';
  }
  else if (!rpt) {
    rpt = 'repeat';
  }
  if (src instanceof Layer) { // Draw the Layer's canvas
    src = src.canvas;
  }
  if (src instanceof CanvasPattern) { // draw an already-created pattern
    this.fillStyle = src;
    this.fillRect(x, y, w, h);
    if (finished instanceof Function) {
      finished.call(this, arguments, true);
    }
  }
  else if (src instanceof Layer) { // Draw the Layer's canvas
    this.save();
    this.globalAlpha = src.opacity;
    if (src.relative == 'canvas') {
      this.translate(world.xOffset, world.yOffset);
    }
    this.fillStyle = this.createPattern(src.canvas, rpt);
    this.fillRect(x, y, w, h);
    this.restore();
    if (finished instanceof Function) {
      finished.call(this, arguments, true);
    }
  }
  else if (src instanceof HTMLCanvasElement || // draw a canvas
      src instanceof HTMLVideoElement) { // draw a video
    this.fillStyle = this.createPattern(src, rpt);
    this.fillRect(x, y, w, h);
    if (finished instanceof Function) {
      finished.call(this, arguments, true);
    }
  }
  else if (src instanceof HTMLImageElement || // draw an image directly
      src instanceof Image) { // same thing
    var image = src, src = image._src || image.src; // check for preloaded src
    if (!src) { // can't draw an empty image
      if (finished instanceof Function) {
        finished.call(this, arguments, false);
      }
      return;
    }
    if (Caches.imagePatterns[src]) { // We already have a pattern; just draw it
      this.fillStyle = Caches.imagePatterns[src];
      this.fillRect(x, y, w, h);
      if (finished instanceof Function) {
        finished.call(this, arguments, true);
      }
      return this.fillStyle;
    }
    if (!Caches.images[src]) { // cache the image by source
      Caches.images[src] = image;
    }
    if (image.complete || (image.width && image.height)) { // draw loaded images
      this.fillStyle = this.createPattern(image, rpt);
      this.fillRect(x, y, w, h);
      Caches.imagePatterns[src] = t.fillStyle;
      if (finished instanceof Function) {
        finished.call(this, arguments, true);
      }
    }
    else { // if the image is not loaded, don't draw it
      if (image._src) { // We've already tried to draw this one
        // The finished callback will run from the first time it was attempted to be drawn
        return;
      }
      var t = this, o = image.onload;
      image.onload = function() {
        if (typeof o == 'function') { // don't overwrite any existing handler
          o();
        }
        Caches.imagePatterns[src] = this.createPattern(image, rpt);
        if (finished instanceof Function) {
          finished.call(t, arguments, false);
        }
      };
    }
  }
  else if (typeof src == 'string') { // file path
    if (Caches.imagePatterns[src]) { // We already have a pattern; just draw it
      this.fillStyle = Caches.imagePatterns[src];
      this.fillRect(x, y, w, h);
      if (finished instanceof Function) {
        finished.call(this, arguments, true);
      }
    }
    else if (Caches.images[src]) { // Image is cached, but no pattern
      if (image.complete || (image.width && image.height)) { // Cached image is loaded
        this.fillStyle = this.createPattern(Caches.images[src], rpt);
        this.fillRect(x, y, w, h);
        Caches.imagePatterns[src] = this.fillStyle;
        if (finished instanceof Function) {
          finished.call(this, arguments, true);
        }
      }
      // If cached image is not loaded, bail; the finished callback will run
      // from the first time it was attempted to be drawn
    }
    else { // Image not loaded yet
      var image = new Image(), t = this;
      image.onload = function() {
        Caches.imagePatterns[src] = this.createPattern(image, rpt);
        if (finished instanceof Function) {
          finished.call(t, arguments, false);
        }
      };
      image._src = src;
      image.src = src;
      Caches.images[src] = image;
    }
  }
  if (Caches.imagePatterns[src]) {
    return Caches.imagePatterns[src];
  }
};

/**
 * Draw a checkerboard pattern.
 *
 * This method can be invoked in two ways:
 * - drawCheckered(squareSize, x, y, w, h, color1, color2);
 * - drawCheckered(color1, color2, squareSize, x, y, w, h);
 *
 * All parameters are optional either way.
 *
 * @param squareSize
 *   (Optional) The width and height, in pixels, of each square in the
 *   checkerboard pattern. Defaults to 80.
 * @param x
 *   (Optional) The x-coordinate of where the pattern's upper-left corner
 *   should be drawn on the canvas. Defaults to 0.
 * @param y
 *   (Optional) The y-coordinate of where the pattern's upper-left corner
 *   should be drawn on the canvas. Defaults to 0.
 * @param w
 *   (Optional) The width of the pattern to draw onto the canvas. Defaults to
 *   twice the squareSize.
 * @param h
 *   (Optional) The height of the pattern to draw onto the canvas. Defaults to
 *   twice the squareSize.
 * @param color1
 *   (Optional) The color of one set of squares in the checkerboard. Defaults
 *   to 'silver'.
 * @param color2
 *   (Optional) The color of the other set of squares in the checkerboard.
 *   Defaults to 'lightGray'.
 *
 * @return
 *   The CanvasPattern object for the pattern that was drawn. It can be helpful
 *   for performance to store this return value and use it to call
 *   drawPattern() in the future if you need to draw this same pattern
 *   repeatedly. (Another option is to cache the drawn pattern in a Layer.)
 */
CanvasRenderingContext2D.prototype.drawCheckered = function(squareSize, x, y, w, h, color1, color2) {
  if (typeof squareSize === 'undefined') squareSize = 80;
  if (typeof squareSize == 'string' && typeof x == 'string') {
    var c1 = squareSize, c2 = x;
    squareSize = y, x = w, y = h, w = color1, h = color2;
    color1 = c1, color2 = c2;
  }
  var pattern = document.createElement('canvas'), pctx = pattern.getContext('2d');
  pattern.width = squareSize*2;
  pattern.height = squareSize*2;
  pctx.fillStyle = color1 || 'silver';
  pctx.fillRect(0, 0, squareSize, squareSize);
  pctx.fillRect(squareSize, squareSize, squareSize, squareSize);
  pctx.fillStyle = color2 || 'lightGray';
  pctx.fillRect(squareSize, 0, squareSize, squareSize);
  pctx.fillRect(0, squareSize, squareSize, squareSize);
  return this.drawPattern(pattern, x || 0, y || 0, w || this.canvas.width, h || this.canvas.height);
};

// DRAW SHAPES ----------------------------------------------------------------

/**
 * Draw a circle.
 * 
 * @param x
 *   The x-coordinate of the center of the circle.
 * @param y
 *   The y-coordinate of the center of the circle.
 * @param r
 *   The radius of the circle.
 * @param fillStyle
 *   A canvas fillStyle used to fill the circle. If not specified, the circle uses the current
 *   fillStyle. If null, the circle is not filled.
 * @param strokeStyle
 *   A canvas strokeStyle used to draw the circle's border. If not specified,
 *   no border is drawn on the circle. If null, the border uses the current
 *   strokeStyle.
 */
CanvasRenderingContext2D.prototype.circle = function(x, y, r, fillStyle, strokeStyle) {
  // Circle
  this.beginPath();
  this.arc(x, y, r, 0, 2 * Math.PI, false);
  if (fillStyle !== null) {
    if (fillStyle) {
      this.fillStyle = fillStyle;
    }
    this.fill();
  }
  if (strokeStyle !== undefined) {
    this.lineWidth = Math.max(Math.ceil(r/15), 1);
    if (strokeStyle) {
      this.strokeStyle = strokeStyle;
    }
    this.stroke();
  }
};

/**
 * Draw a smiley face.
 * 
 * The Actor class uses this as a placeholder.
 * 
 * @param x
 *   The x-coordinate of the center of the smiley face.
 * @param y
 *   The y-coordinate of the center of the smiley face.
 * @param r
 *   The radius of the smiley face.
 * @param fillStyle
 *   (optional) The color / fill-style of the smiley face.
 */
CanvasRenderingContext2D.prototype.drawSmiley = function(x, y, r, fillStyle) {
  var thickness = Math.max(Math.ceil(r/15), 1);
  
  // Circle
  this.circle(x, y, r, fillStyle || 'lightBlue', 'black');
  
  // Smile
  this.beginPath();
  this.arc(x, y, r*0.6, Math.PI*0.1, Math.PI*0.9, false);
  this.lineWidth = thickness;
  this.strokeStyle = 'black';
  this.stroke();
    
  // Eyes
  this.beginPath();
  this.arc(x - r*0.3, y - r*0.25, Math.max(Math.ceil(r/15), 1), 0, 2 * Math.PI, false);
  this.fillStyle = 'black';
  this.fill();
  this.arc(x + r*0.3, y - r*0.25, Math.max(Math.ceil(r/15), 1), 0, 2 * Math.PI, false);
  this.fillStyle = 'black';
  this.fill();
};

/**
 * Draws a blue-and-yellow radial gradient across the entire background of the
 * world. This is mainly useful to demonstrate that scrolling works if the
 * world is bigger than the canvas.
 */
CanvasRenderingContext2D.prototype.drawBkgdRadialGradient = function() {
  // Draw a radial gradient on the background.
  var radgrad = context.createRadialGradient(
      world.width/2, world.height/2, 50,
      world.width/2, world.height/2, world.width/2
  );
  radgrad.addColorStop(0, '#A7D30C');
  radgrad.addColorStop(0.6, '#067A9E');
  radgrad.addColorStop(1, 'rgba(1,159,98,0)');
  this.clear(radgrad);
};

// INPUT ----------------------------------------------------------------------

/**
 * Prevent the default behavior from occurring when hitting keys.
 * 
 * This won't prevent everything -- for example it won't prevent combinations
 * of multiple non-control-character keys -- and if you want to do something
 * like prevent the default effect of hitting Enter but not Shift+Enter then
 * you need to handle that yourself.
 */
App.preventDefaultKeyEvents = function(combinations) {
  jQuery(document).keydown(combinations, function() { return false; });
};

/**
 * Determines whether the mouse is hovering over an object.
 * 
 * The object in question must have these properties: x, y, width, height.
 * 
 * @param obj
 *   The object to check.
 */
App.isHovered = function(obj) {
  var offsets = world.getOffsets(), xPos = obj.x - offsets.x, yPos = obj.y - offsets.y;
  return mouse.coords.x > xPos && mouse.coords.x < xPos + obj.width &&
      mouse.coords.y > yPos && mouse.coords.y < yPos + obj.height;
};

/**
 * Encapsulates mouse position scrolling.
 *
 * To use mouse scrolling, call mouse.scroll.enable(). To disable, call
 * .disable(). To check if mouse scrolling is enabled, test .isEnabled().
 *
 * .isScrolling() returns true when the viewport is scrolling and false
 * otherwise. The "mousescrollon" and "mousescrolloff" events are fired on the
 * document when the viewport starts and stops scrolling, respectively. Binding
 * to them may be useful if you want to pause animation or display something
 * while the viewport is moving.
 *
 * .getThreshold() and .setThreshold() refer to a fractional percentage
 * [0.0-0.5) of the width of the canvas. If the mouse is within this percent of
 * the edge of the canvas, the viewport attempts to scroll. The default is 0.2
 * (20%).
 *
 * .getScrollDistance() and .setScrollDistance() refer to the maximum distance
 * in pixels that the viewport will move each second while scrolling (the
 * movement can be less when the viewport is very close to an edge of the
 * world). Defaults to 350.
 */
mouse.scroll = (function() {
  var THRESHOLD = 0.2, MOVEAMOUNT = 350;
  var translating = false, scrolled = {x: 0, y: 0}, enabled = false;
  function translate(doOffset) {
    var t = false, ma;
    if (doOffset === undefined) doOffset = true;

    // Left
    if (mouse.coords.x < canvas.width * THRESHOLD) {
      if (doOffset) {
        ma = Math.round(Math.min(world.xOffset, MOVEAMOUNT * App.timer.lastDelta));
        world.xOffset -= ma;
        scrolled.x -= ma;
        context.translate(ma, 0);
      }
      t = true;
    }
    // Right
    else if (mouse.coords.x > canvas.width * (1-THRESHOLD)) {
      if (doOffset) {
        ma = Math.round(Math.min(world.width - canvas.width - world.xOffset, MOVEAMOUNT * App.timer.lastDelta));
        world.xOffset += ma;
        scrolled.x += ma;
        context.translate(-ma, 0);
      }
      t = true;
    }

    // Up
    if (mouse.coords.y < canvas.height * THRESHOLD) {
      if (doOffset) {
        ma = Math.round(Math.min(world.yOffset, MOVEAMOUNT * App.timer.lastDelta));
        world.yOffset -= ma;
        scrolled.y -= ma;
        context.translate(0, ma);
      }
      t = true;
    }
    // Down
    else if (mouse.coords.y > canvas.height * (1-THRESHOLD)) {
      if (doOffset) {
        ma = Math.round(Math.min(world.height - canvas.height - world.yOffset, MOVEAMOUNT * App.timer.lastDelta));
        world.yOffset += ma;
        scrolled.y += ma;
        context.translate(0, -ma);
      }
      t = true;
    }

    // We're not translating if we're not moving.
    if (doOffset && scrolled.x == 0 && scrolled.y == 0) {
      t = false;
    }

    if (doOffset && translating != t) {
      if (translating) { // We were scrolling. Now we're not.
        jQuery(document).trigger('mousescrollon');
      }
      else { // We weren't scrolling. Now we are.
        jQuery(document).trigger('mousescrolloff');
      }
    }
    translating = t;
    return scrolled;
  }
  return {
    enable: function() {
      if (enabled) {
        return;
      }
      enabled = true;
      $canvas.on('mouseenter.translate touchstart.translate', function() {
        jQuery(this).on('mousemove.translate', function() {
          translate(false);
        });
      });
      $canvas.on('mouseleave.translate touchleave.translate', function() {
        translating = false;
        jQuery(this).off('.translate');
      });
    },
    disable: function() {
      $canvas.off('.translate');
      translating = false;
      enabled = false;
    },
    isEnabled: function() {
      return enabled;
    },
    isScrolling: function() {
      return translating;
    },
    _update: function() {
      if (translating) {
        return translate();
      }
    },
    setThreshold: function(t) {
      THRESHOLD = t;
    },
    getThreshold: function() {
      return THRESHOLD;
    },
    setScrollDistance: function(a) {
      MOVEAMOUNT = a;
    },
    getScrollDistance: function() {
      return MOVEAMOUNT;
    },
  };
})();

// TIMER ----------------------------------------------------------------------

/**
 * A timer.
 *
 * Adapted from https://github.com/mrdoob/three.js/blob/master/src/core/Clock.js
 *
 * @param autoStart
 *   Whether to start the timer immediately upon instantiation or wait until
 *   the start() method is called.
 */
function Timer(autoStart) {
  this.autoStart = autoStart === undefined ? true : autoStart;
  this.lastStartTime = 0;
  this.lastDeltaTime = 0;
  this.elapsedTime = 0;
  this.running = false;
  /**
   * Get the time elapsed in seconds since the last time a delta was measured.
   *
   * Deltas are taken when the timer starts or stops or elapsed time is
   * measured.
   *
   * Note that if the timer is stopped and autoStart is on, calling this method
   * will start the timer again.
   */
  this.getDelta = function() {
    var diff = 0;
    if (this.autoStart && !this.running) {
      this.start();
    }
    if (this.running) {
      var now = Date.now();
      diff = (now - this.lastDeltaTime) / 1000; // ms to s
      this.lastDeltaTime = now;
      this.elapsedTime += diff;
    }
    return diff;
  };
  /**
   * Start the timer.
   */
  this.start = function() {
    if (this.running) {
      return;
    }
    this.lastStartTime = this.lastDeltaTime = Date.now();
    this.running = true;
  };
  /**
   * Stop the timer.
   */
  this.stop = function () {
    this.running = false;
    this.elapsedTime += this.getDelta();
  };
  /**
   * Get the amount of time the timer has been running.
   */
  this.getElapsedTime = function() {
    this.elapsedTime += this.getDelta();
    return this.elapsedTime;
  };
  if (this.autoStart) {
    this.start();
  }
}

// UTILITIES ------------------------------------------------------------------

App.Utils = {};

/**
 * Convert a percent (out of 100%) to the corresponding pixel position in the world.
 */
App.Utils.percentToPixels = function(percent) {
  return {
    x: Math.floor(world.width * percent / 100),
    y: Math.floor(world.height * percent / 100),
  };
};

/**
 * Get a random number between two numbers.
 */
App.Utils.getRandBetween = function(lo, hi) {
  if (lo > hi) {
    var t = lo;
    lo = hi;
    hi = t;
  }
  return Math.random() * (hi - lo) + lo;
};

/**
 * Get a random integer between two numbers, inclusive.
 *
 * This function makes no assumptions; despite the parameters being called lo
 * and hi, either one can be higher, and either or both can be integers or
 * floats. If either of the numbers is a float, the random distribution remains
 * equal among eligible integers; that is, if lo==3.3 and hi==5, 4 and 5 are
 * equally likely to be returned. Negative numbers work as well.
 */
App.Utils.getRandIntBetween = function(lo, hi) {
  if (lo > hi) {
    var t = lo;
    lo = hi;
    hi = t;
  }
  lo = Math.ceil(lo);
  hi = Math.floor(hi);
  return Math.floor(Math.random()*(hi-lo+1)+lo);
};

/**
 * Get the keys (property names) of an object.
 *
 * This would be useful as an extension of Object, but extending Object can
 * break quite a lot of external code (including jQuery).
 */
App.Utils.keys = function(obj) {
  var ks = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      ks.push(key);
    }
  }
  return ks;
};

/**
 * Check if any of the elements in an array are found in another array.
 *
 * @param search
 *   An array of elements to search for in the target.
 * @param target
 *   An array in which to search for matching elements.
 *
 * @return
 *   true if at least one match was found; false otherwise.
 */
App.Utils.anyIn = function(search, target) {
  for (var i = 0, l = search.length; i < l; i++) {
    if (target.indexOf(search[i]) != -1) {
      return true;
    }
  }
  return false;
}

/**
 * Determines whether a is within e of b, inclusive.
 */
App.Utils.almostEqual = function(a, b, e) {
  // Another (slower) way to express this is Math.abs(a - b) < e
  return a >= b - e && a <= b + e;
};

/**
 * Ends the game, displays "GAME OVER," and allows clicking to restart.
 *
 * To disable clicking to restart, run $canvas.off('.gameover');
 */
App.gameOver = function() {
  stopAnimating();
  // This runs during update() before the final draw(), so we have to delay it.
  setTimeout(function() {
    context.save();
    context.font = '100px Arial';
    context.fillStyle = 'black';
    context.strokeStyle = 'lightGray';
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    context.shadowColor = 'black';
    context.shadowBlur = 8;
    context.lineWidth = 5;
    var x = Math.round(world.xOffset+canvas.width/2);
    var y = Math.round(world.yOffset+canvas.height/2);
    context.strokeText("GAME OVER", x, y);
    context.fillText("GAME OVER", x, y);
    context.restore();
  }, 100);
  $canvas.css('cursor', 'pointer');
  $canvas.one('click.gameover', function(e) {
    e.preventDefault();
    $canvas.css('cursor', 'auto');
    var start = setup(true);
    if (start !== false) {
      startAnimating();
    }
    jQuery(document).trigger('start');
  });
};

/**
 * Remove an item from an array by value.
 */
Array.prototype.remove = function(item) {
  var i = this.indexOf(item);
  if (i === undefined || i < 0) {
    return undefined;
  }
  return this.splice(i, 1);
};

/**
 * Round a number to a specified precision.
 *
 * Usage:
 * 3.5.round(0) // 4
 * Math.random().round(4) // 0.8179
 * var a = 5532; a.round(-2) // 5500
 * Number.prototype.round(12345.6, -1) // 12350
 *
 * @param v
 *   The number to round. (This parameter only applies if this function is
 *   called directly. If it is invoked on a Number instance, then that number
 *   is used instead, and only the precision parameter needs to be passed.)
 * @param a
 *   The precision, i.e. the number of digits after the decimal point
 *   (including trailing zeroes, even though they're truncated in the returned
 *   result). If negative, precision indicates the number of zeroes before the
 *   decimal point, e.g. round(1234, -2) yields 1200. If non-integral, the
 *   floor of the precision is used. 
 */
Number.prototype.round = function(v, a) {
  if (typeof a === 'undefined') {
    a = v;
    v = this;
  }
  if (!a) a = 0;
  var m = Math.pow(10,a|0);
  return Math.round(v*m)/m;
};

Number.prototype.sign = function(v) {
  if (typeof v === 'undefined') {
    v = this;
  }
  return v > 0 ? 1 : (v < 0 ? -1 : 0);
};

(function(console) {
  /**
   * Get a string with the function, filename, and line number of the call.
   *
   * This provides a unique ID to identify where each call originated.
   *
   * This function was written by Steven Wittens (unconed). MIT Licensed.
   * More at https://github.com/unconed/console-extras.js.
   */
  function getCallID() {
    var stack = new Error().stack;
    if (stack) {
      var lines = stack.split(/\n/g), skip = 2;
      var found = false, offset = 0;
      for (var i in lines) {
        if (offset == skip) {
          return lines[i];
        }
        if (!found && lines[i].match(/getCallID/)) {
          found = true;
        }
        if (found) {
          offset++;
        }
      }
    }
    return 'exception';
  }
  /**
   * Periodically log a message to the JavaScript console.
   *
   * This is useful for logging things in loops; it avoids being overwhelmed by
   * an unstoppable barrage of similar log messages. Example calls:
   *
   * # Log "message" to the console no more than every 500ms.
   * console.throttle('message', 500);
   * # Log "message 1" and "message 2" as errors no more than every 500ms.
   * console.throttle('message 1', 'message 2', 500, console.error);
   *
   * @param ...
   *   An arbitrary number of arguments to pass to the loggging function.
   * @param freq
   *   The minimum amount of time in milliseconds that must pass between the
   *   same call before logging the next one. To only log something once, pass
   *   Infinity to this parameter.
   * @param func
   *   (Optional) The logging function to use. Defaults to console.log.
   *
   * @return
   *   The console object (this method is chainable).
   */
  console.throttle = function() {
    if (arguments.length < 2) {
      return console;
    }
    var freq = 0, id = getCallID(), func = Array.prototype.pop.call(arguments);
    if (typeof func == 'number') {
      freq = func;
      func = console.log || function() {};
    }
    else if (typeof func == 'function') {
      freq = Array.prototype.pop.call(arguments);
    }
    if (typeof this.lastLogged === 'undefined') {
      this.lastLogged = {};
    }
    if (typeof this.lastLogged[id] === 'undefined') {
      this.lastLogged[id] = 0;
    }
    var now = Date.now();
    if (now > this.lastLogged[id] + freq) {
      this.lastLogged[id] = now;
      func.apply(func, arguments);
    }
    return console;
  };
})(console);