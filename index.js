/**
 * Module dependencies
 */

var emitter = require('emitter');
var transform = require('transform-property');
var redraw = require('redraw');
var afterTransition = require('after-transition');
var scale = require('scale-to-bounds');
var viewport = require('viewport');
var has3d = require('has-translate3d');
var overlay = require('overlay');
var delegate = require('delegate');
var events = require('events');
var nextTick = require('next-tick');

/**
 * Create the supported translate string.
 * @param  {Int} x coordinate
 * @param  {Int} y coordinate
 * @return {String}
 */

function translateString(x, y){
  return has3d
    ? 'translate3d('+ x +'px, '+ y +'px, 0)'
    : 'translate('+ x +'px, '+ y + 'px)';
}

/**
 * Bootstrap-style API that allows designers to invoke zooming
 * the element using markup
 */

var zoomListener = delegate.bind(document, '[data-zoom-url]', 'click', function(e){
  new Zoom(e.target).show();
});



/**
 * Javascript API.
 * @param  {Element} el
 * @param  {String} url
 * @return {Zoom}
 */

module.exports = exports = Zoom;

/**
 * Zoom Constructor
 * @param {Element} el
 * @param {String} url
 */

function Zoom(el, url){
  if (!(this instanceof Zoom)) return new Zoom(el, url);
  this.thumb = el;
  if (this.thumb.getAttribute('data-zoom-overlay')) this.overlay();
  this.padding();
  this.backgroundURL = url;
  this.viewport = {};
}

emitter(Zoom.prototype);

/**
 * Enable overlay.
 * @return {Zoom}
 */

Zoom.prototype.overlay = function(){
  this._overlay = overlay('image-zoom-overlay');
  return this;
};

/**
 * Set padding (or should this be margin?) around the zoomed
 * image.
 *
 * @param  {Number} num in pixels
 * @return {Zoom}
 */

Zoom.prototype.padding = function(num){
  this._padding = num || this.thumb.getAttribute('data-zoom-padding') || 0;
  return this;
};

/**
 * While our image is loading, we add a loading
 * class to our target element.
 *
 * @param  {Function} fn
 */

Zoom.prototype.loadImage = function(fn){
  if (this.hasLoaded) return fn();
  var img = this.clone = new Image();
  setTimeout(function(){
    if (!this.hasLoaded) this.loading();
  }.bind(this), 50);
  img.onload = function(){
    this.hasLoaded = true;
    this.finishLoading();
    this.imageWidth = img.width;
    this.imageHeight = img.height;
    fn();
  }.bind(this);
  img.src = this.src;
};

/**
 * Add loading class
 *
 * @return {Zoom}
 */

Zoom.prototype.loading = function(){
  this.thumb.classList.add('loading');
  return this;
};

/**
 * Remove loading class
 *
 * @return {Zoom}
 */

Zoom.prototype.finishLoading = function(){
  this.thumb.classList.remove('loading');
  return this;
};

/**
 * Get image dimensions
 *
 * @return {Zoom}
 */

Zoom.prototype.getDimensions = function(){
  var pos = this.thumb.getBoundingClientRect();
  this.origin = {
    x : pos.left,
    y : pos.top,
    w : this.thumb.clientWidth,
    h : this.thumb.clientHeight
  };
  this.src = this.thumb.getAttribute('data-zoom-url') || this.backgroundURL;
  return this;
};

/**
 * Append a clone of the image to the DOM in
 * prep for our zoom animation.
 *
 * @return {Zoom}
 */

Zoom.prototype.appendClone = function(){
  this.clone.classList.add('zoom-image-clone');
  nextTick(function(){
    this.docEvents = events(document, this);
    this.docEvents.bind('click', 'hide');
  }.bind(this));
  this.windowEvents = events(window, this);
  this.windowEvents.bind('resize');
  document.body.appendChild(this.clone);
  return this;
};

// Debounce this?
Zoom.prototype.onresize = function(){
  this.determineZoomedSize();
  this.updateStyles();
};

/**
 * Determine size of zoomed image
 *
 * @return {Zoom}
 */

Zoom.prototype.determineZoomedSize = function(){
  // image size
  var iw = this.imageWidth;
  var ih = this.imageHeight;

  // viewport size
  var vp = viewport();

  // zoomed image max size
  var target = scale(iw, ih, vp.width - this._padding, vp.height - this._padding);

  // determine left & top position of zoomed image
  var left = (vp.width / 2) - (target.width / 2);
  var top = (vp.height / 2) - (target.height / 2);

  this.target = {
    x : left,
    y: top,
    w: target.width,
    h: target.height
  };

  return this;
};

/**
 * Yodate zoom styles
 *
 * @return {Zoom}
 */

Zoom.prototype.updateStyles = function(){
  var t = this.target;
  var s = this.clone.style;
  s.width = t.w + 'px';
  s.height = t.h + 'px';
  s.left = t.x + 'px';
  s.top = t.y + 'px';
  return this;
};

/**
 * Set original dimensions
 *
 * @return {Zoom}
 */

Zoom.prototype.setOriginalDeminsions = function(){
  var o = this.origin;
  var t = this.target;
  this.updateStyles();

  if (transform){
    var scale = o.w / t.w;
    var translateX = (o.x + (o.w / 2)) - (t.x + (t.w / 2));
    var translateY = (o.y + (o.h / 2)) - (t.y + (t.h / 2));
    var translate3d = translateString(translateX, translateY);
    var scaleProp = ' scale('+ scale +')';
    this.clone.style[transform] = translate3d + scaleProp;
  }

  return this;
};

/**
 * Set transition Position
 * @return {Zoom}
 */

Zoom.prototype.setTargetPosition = function(){
  if (transform){
    this.clone.style[transform] = translateString(0, 0) + ' scale(1)';
  }
  return this;
};

/**
 * Show our zoomed image
 *
 * @param  {Event} e
 */

Zoom.prototype.show = function(e){
  if (e) e.preventDefault();
  this.getDimensions();

  function onImageLoad() {
    this.emit('showing');
    if (this._overlay) this._overlay.show();
    this.determineZoomedSize()
      .setOriginalDeminsions()
      .appendClone();
    this.thumb.style.opacity = 0;
    redraw(this.clone);
    this.setTargetPosition();
    afterTransition.once(this.clone, function(){
      this.emit('shown');
    }.bind(this));
  }

  this.loadImage(onImageLoad.bind(this));
  return this;
};

/**
 * Hide our zoomed image
 * @param  {Event} e
 * @return {Zoom}
 */

Zoom.prototype.hide = function(e){
  if (e) e.preventDefault();
  this.windowEvents.unbind();
  this.docEvents.unbind();
  this.setOriginalDeminsions();
  this.emit('hiding');
  if (this._overlay) {
    this._overlay.hide();
  }
  afterTransition.once(this.clone, function(){
    this.thumb.style.opacity = 1;
    this.clone.parentNode.removeChild(this.clone);
    this.emit('hidden');
  }.bind(this));
  return this;
};

/**
 * Enable plugin usage
 *
 * @param  {function} plugin
 * @param  {Object} options
 * @return {Zoom}
 */

Zoom.prototype.use = function(plugin, options){
  plugin(this, options);
  return this;
};

/**
 * Unbind our event listener
 */

exports.stopListening = function(){
  delegate.unbind(document, 'click', zoomListener, false);
};
