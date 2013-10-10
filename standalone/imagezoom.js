;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-indexof/index.js", function(exports, require, module){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-classes/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name){
  // classList
  if (this.list) {
    this.list.toggle(name);
    return this;
  }

  // fallback
  if (this.has(name)) {
    this.remove(name);
  } else {
    this.add(name);
  }
  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var arr = this.el.className.split(re);
  if ('' === arr[0]) arr.pop();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("component-transform-property/index.js", function(exports, require, module){

var styles = [
  'webkitTransform',
  'MozTransform',
  'msTransform',
  'OTransform',
  'transform'
];

var el = document.createElement('p');
var style;

for (var i = 0; i < styles.length; i++) {
  style = styles[i];
  if (null != el.style[style]) {
    module.exports = style;
    break;
  }
}

});
require.register("ianstormtaylor-redraw/index.js", function(exports, require, module){

/**
 * Expose `redraw`.
 */

module.exports = redraw;


/**
 * Force a redraw on an `el`.
 *
 * @param {Element} el
 */

function redraw (el) {
  el.offsetHeight;
}
});
require.register("component-event/index.js", function(exports, require, module){

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture || false);
  } else {
    el.attachEvent('on' + type, fn);
  }
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture || false);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

});
require.register("component-events/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var events = require('event');
var delegate = require('delegate');

/**
 * Expose `Events`.
 */

module.exports = Events;

/**
 * Initialize an `Events` with the given
 * `el` object which events will be bound to,
 * and the `obj` which will receive method calls.
 *
 * @param {Object} el
 * @param {Object} obj
 * @api public
 */

function Events(el, obj) {
  if (!(this instanceof Events)) return new Events(el, obj);
  if (!el) throw new Error('element required');
  if (!obj) throw new Error('object required');
  this.el = el;
  this.obj = obj;
  this._events = {};
}

/**
 * Subscription helper.
 */

Events.prototype.sub = function(event, method, cb){
  this._events[event] = this._events[event] || {};
  this._events[event][method] = cb;
};

/**
 * Bind to `event` with optional `method` name.
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 * Examples:
 *
 *  Direct event handling:
 *
 *    events.bind('click') // implies "onclick"
 *    events.bind('click', 'remove')
 *    events.bind('click', 'sort', 'asc')
 *
 *  Delegated event handling:
 *
 *    events.bind('click li > a')
 *    events.bind('click li > a', 'remove')
 *    events.bind('click a.sort-ascending', 'sort', 'asc')
 *    events.bind('click a.sort-descending', 'sort', 'desc')
 *
 * @param {String} event
 * @param {String|function} [method]
 * @return {Function} callback
 * @api public
 */

Events.prototype.bind = function(event, method){
  var e = parse(event);
  var el = this.el;
  var obj = this.obj;
  var name = e.name;
  var method = method || 'on' + name;
  var args = [].slice.call(arguments, 2);

  // callback
  function cb(){
    var a = [].slice.call(arguments).concat(args);
    obj[method].apply(obj, a);
  }

  // bind
  if (e.selector) {
    cb = delegate.bind(el, e.selector, name, cb);
  } else {
    events.bind(el, name, cb);
  }

  // subscription for unbinding
  this.sub(name, method, cb);

  return cb;
};

/**
 * Unbind a single binding, all bindings for `event`,
 * or all bindings within the manager.
 *
 * Examples:
 *
 *  Unbind direct handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * Unbind delegate handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * @param {String|Function} [event]
 * @param {String|Function} [method]
 * @api public
 */

Events.prototype.unbind = function(event, method){
  if (0 == arguments.length) return this.unbindAll();
  if (1 == arguments.length) return this.unbindAllOf(event);

  // no bindings for this event
  var bindings = this._events[event];
  if (!bindings) return;

  // no bindings for this method
  var cb = bindings[method];
  if (!cb) return;

  events.unbind(this.el, event, cb);
};

/**
 * Unbind all events.
 *
 * @api private
 */

Events.prototype.unbindAll = function(){
  for (var event in this._events) {
    this.unbindAllOf(event);
  }
};

/**
 * Unbind all events for `event`.
 *
 * @param {String} event
 * @api private
 */

Events.prototype.unbindAllOf = function(event){
  var bindings = this._events[event];
  if (!bindings) return;

  for (var method in bindings) {
    this.unbind(event, method);
  }
};

/**
 * Parse `event`.
 *
 * @param {String} event
 * @return {Object}
 * @api private
 */

function parse(event) {
  var parts = event.split(/ +/);
  return {
    name: parts.shift(),
    selector: parts.join(' ')
  }
}

});
require.register("anthonyshort-has-transitions/index.js", function(exports, require, module){
/**
 * This will store the property that the current
 * browser uses for transitionDuration
 */
var property;

/**
 * The properties we'll check on an element
 * to determine if it actually has transitions
 * We use duration as this is the only property
 * needed to technically have transitions
 * @type {Array}
 */
var types = [
  "transitionDuration",
  "MozTransitionDuration",
  "webkitTransitionDuration"
];

/**
 * Determine the correct property for this browser
 * just once so we done need to check every time
 */
while(types.length) {
  var type = types.shift();
  if(type in document.body.style) {
    property = type;
  }
}

/**
 * Determine if the browser supports transitions or
 * if an element has transitions at all.
 * @param  {Element}  el Optional. Returns browser support if not included
 * @return {Boolean}
 */
function hasTransitions(el){
  if(!property) {
    return false; // No browser support for transitions
  }
  if(!el) {
    return property != null; // We just want to know if browsers support it
  }
  var duration = getComputedStyle(el)[property];
  return duration !== "" && parseFloat(duration) !== 0; // Does this element have transitions?
}

module.exports = hasTransitions;
});
require.register("anthonyshort-css-emitter/index.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var events = require('event');

// CSS events

var watch = [
  'transitionend'
, 'webkitTransitionEnd'
, 'oTransitionEnd'
, 'MSTransitionEnd'
, 'animationend'
, 'webkitAnimationEnd'
, 'oAnimationEnd'
, 'MSAnimationEnd'
];

/**
 * Expose `CSSnext`
 */

module.exports = CssEmitter;

/**
 * Initialize a new `CssEmitter`
 *
 */

function CssEmitter(element){
  if (!(this instanceof CssEmitter)) return new CssEmitter(element);
  this.el = element;
}

/**
 * Bind CSS events.
 *
 * @api public
 */

CssEmitter.prototype.bind = function(fn){
  for (var i=0; i < watch.length; i++) {
    events.bind(this.el, watch[i], fn);
  }
  return this;
};

/**
 * Unbind CSS events
 * 
 * @api public
 */

CssEmitter.prototype.unbind = function(fn){
  for (var i=0; i < watch.length; i++) {
    events.unbind(this.el, watch[i], fn);
  }
  return this;
};

/**
 * Fire callback only once
 * 
 * @api public
 */

CssEmitter.prototype.once = function(fn){
  var self = this;
  function on(){
    self.unbind(on);
    fn.apply(self.el, arguments);
  }
  self.bind(on);
  return this;
};


});
require.register("anthonyshort-after-transition/index.js", function(exports, require, module){
var hasTransitions = require('has-transitions');
var emitter = require('css-emitter');

function afterTransition(el, callback) {
  if(hasTransitions(el)) {
    return emitter(el).bind(callback);
  }
  return callback.apply(el);
};

afterTransition.once = function(el, callback) {
  afterTransition(el, function fn(){
    callback.apply(el);
    emitter(el).unbind(fn);
  });
};

module.exports = afterTransition;
});
require.register("component-type/index.js", function(exports, require, module){

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object String]': return 'string';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val && val.nodeType === 1) return 'element';
  if (val === Object(val)) return 'object';

  return typeof val;
};

});
require.register("ianstormtaylor-is-empty/index.js", function(exports, require, module){

/**
 * Expose `isEmpty`.
 */

module.exports = isEmpty;


/**
 * Has.
 */

var has = Object.prototype.hasOwnProperty;


/**
 * Test whether a value is "empty".
 *
 * @param {Mixed} val
 * @return {Boolean}
 */

function isEmpty (val) {
  if (null == val) return true;
  if ('number' == typeof val) return 0 === val;
  if (undefined !== val.length) return 0 === val.length;
  for (var key in val) if (has.call(val, key)) return false;
  return true;
}
});
require.register("ianstormtaylor-is/index.js", function(exports, require, module){

var isEmpty = require('is-empty');

try {
  var typeOf = require('type');
} catch (e) {
  var typeOf = require('component-type');
}


/**
 * Types.
 */

var types = [
  'arguments',
  'array',
  'boolean',
  'date',
  'element',
  'function',
  'null',
  'number',
  'object',
  'regexp',
  'string',
  'undefined'
];


/**
 * Expose type checkers.
 *
 * @param {Mixed} value
 * @return {Boolean}
 */

for (var i = 0, type; type = types[i]; i++) exports[type] = generate(type);


/**
 * Add alias for `function` for old browsers.
 */

exports.fn = exports['function'];


/**
 * Expose `empty` check.
 */

exports.empty = isEmpty;


/**
 * Expose `nan` check.
 */

exports.nan = function (val) {
  return exports.number(val) && val != val;
};


/**
 * Generate a type checker.
 *
 * @param {String} type
 * @return {Function}
 */

function generate (type) {
  return function (value) {
    return type === typeOf(value);
  };
}
});
require.register("bmcmahen-scale-to-bounds/index.js", function(exports, require, module){
/**
 * Return the maximum size given a set of bounds
 * while maintaining the original aspect ratio.
 * @param  {Number} ow original width
 * @param  {Number} oh original height
 * @param  {Number} mw max width
 * @param  {Number} mh max height
 * @return {Object}
 */

module.exports = function(ow, oh, mw, mh){
  var scale = Math.min(mw / ow, mh / oh);
  if (scale > 1) scale = 1;
  return {
    width : ow * scale,
    height : oh * scale
  };
};
});
require.register("bmcmahen-viewport/index.js", function(exports, require, module){

/**
 * get the current viewport size
 * credit goes here: http://stackoverflow.com/a/11744120/1198166
 * @return {Object} containing width and height
 */

module.exports = function(){
  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0];

  return {
    width: w.innerWidth || e.clientWidth || g.clientWidth,
    height: w.innerHeight|| e.clientHeight|| g.clientHeight
  };
}
});
require.register("component-has-translate3d/index.js", function(exports, require, module){

var prop = require('transform-property');
// IE8<= doesn't have `getComputedStyle`
if (!prop || !window.getComputedStyle) return module.exports = false;

var map = {
  webkitTransform: '-webkit-transform',
  OTransform: '-o-transform',
  msTransform: '-ms-transform',
  MozTransform: '-moz-transform',
  transform: 'transform'
};

// from: https://gist.github.com/lorenzopolidori/3794226
var el = document.createElement('div');
el.style[prop] = 'translate3d(1px,1px,1px)';
document.body.insertBefore(el, null);
var val = getComputedStyle(el).getPropertyValue(map[prop]);
document.body.removeChild(el);
module.exports = null != val && val.length && 'none' != val;

});
require.register("eugenicsarchivesca-overlay/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('emitter')
  , classes = require('classes');

/**
 * Expose `Overlay`.
 */

module.exports = Overlay;

/**
 * Initialize a new `Overlay`.
 *
 * @param {Object} options
 * @api public
 */

function Overlay(options) {
  if (!(this instanceof Overlay)) return new Overlay(options);
  options || (options = {});
  this.duration = options.duration || 300;
}

/**
 * Mixin 'Emitter'
 */

Emitter(Overlay.prototype);

/**
 * Show the overlay.
 *
 * Emits "show" event.
 *
 * @return {Overlay}
 * @api public
 */

Overlay.prototype.show = function(){
  if (this.el) return;
  this.el = document.createElement('div');
  this.el.className = 'hide';
  this.el.id = 'overlay';
  document.getElementsByTagName('body')[0].appendChild(this.el);
  this.emit('show');
  var self = this;
  setTimeout(function(){
    classes(self.el).remove('hide');
  }, 0);
  return this;
};

/**
 * Hide the overlay.
 *
 * Emits "hide" event.
 *
 * @return {Overlay}
 * @api public
 */

Overlay.prototype.hide = function(){
  this.emit('hide');
  return this.remove();
};

/**
 * Remove the overlay from the DOM
 * Emits 'close' event.
 */

Overlay.prototype.remove = function(){
  if (!this.el) return;
  var self = this;
  classes(this.el).add('hide');
  setTimeout(function(){
    self.emit('close');
    self.el.parentNode.removeChild(self.el);
    delete self.el;
  }, this.duration);
  return this;
};

});
require.register("component-query/index.js", function(exports, require, module){

function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
};

});
require.register("component-matches-selector/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var query = require('query');

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matchesSelector
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

});
require.register("discore-closest/index.js", function(exports, require, module){
var matches = require('matches-selector')

module.exports = function (element, selector, checkYoSelf, root) {
  element = checkYoSelf ? element : element.parentNode
  root = root || document

  do {
    if (matches(element, selector))
      return element
    // After `matches` on the edge case that
    // the selector matches the root
    // (when the root is not the document)
    if (element === root)
      return
    // Make sure `element !== document`
    // otherwise we get an illegal invocation
  } while ((element = element.parentNode) && element !== document)
}
});
require.register("component-delegate/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var closest = require('closest')
  , event = require('event');

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    var target = e.target || e.srcElement;
    e.delegateTarget = closest(target, selector, true, el);
    if (e.delegateTarget) fn.call(el, e);
  }, capture);
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

});
require.register("image-zoom/index.js", function(exports, require, module){
var Emitter = require('emitter');
var classes = require('classes');
var transform = require('transform-property');
var redraw = require('redraw');
var events = require('events');
var afterTransition = require('after-transition');
var is = require('is');
var scale = require('scale-to-bounds');
var viewport = require('viewport');
var has3d = require('has-translate3d');
var overlay = require('overlay');
var delegate = require('delegate');

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

var bnd = delegate.bind(document, '[data-zoom-url]', 'click', function(e){
  var z = new Zoom(e.target);
  z.show();
});



/**
 * Javascript API. Pass in either an element or list
 * of elements, plus the optional URL of the image.
 * @param  {Element} el
 * @param  {String} url
 * @return {Zoom}
 */

module.exports = function(el, url){
  delegate.unbind(document, 'click', bnd, false);
  if (is.object(el)){
    var zooms = [];
    for (var i = 0; i < el.length; i++){
      zooms.push(new Zoom(el[i]).bind());
    }
    return zooms;
  }
  return new Zoom(el, url).bind();
}

/**
 * Zoom Constructor
 * @param {Element} el
 * @param {String} url
 */

var Zoom = function(el, url){
  this.thumb = el;
  if (this.thumb.getAttribute('data-zoom-overlay')){
    this.overlay();
  }
  this.padding();
  this.backgroundURL = url;
  this.viewport = {};
};

Emitter(Zoom.prototype);

/**
 * Bind zoom click event.
 * @return {Zoom}
 */

Zoom.prototype.bind = function(){
  this.events = events(this.thumb, this);
  this.events.bind('click', 'show');
  return this;
};

/**
 * Enable overlay.
 * @return {Zoom}
 */

Zoom.prototype.overlay = function(){
  this._overlay = overlay();
  return this;
};

/**
 * Set padding (or should this be margin?) around the zoomed
 * image.
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
 * @param  {Function} fn
 */

Zoom.prototype.loadImage = function(fn){
  if (this.hasLoaded) return fn();
  var img = this.clone = new Image();
  var self = this;
  setTimeout(function(){
    if (!self.hasLoaded) self.loading();
  }, 50);
  img.onload = function(){
    self.hasLoaded = true;
    self.finishLoading();
    self.imageWidth = img.width;
    self.imageHeight = img.height;
    fn();
  };
  img.src = this.src;
};

Zoom.prototype.loading = function(){
  classes(this.thumb).add('loading');
};

Zoom.prototype.finishLoading = function(){
  classes(this.thumb).remove('loading');
};

Zoom.prototype.getDimensions = function(fn){
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

Zoom.prototype.appendClone = function(){
  classes(this.clone).add('zoom-image-clone');
  this.windowEvents = events(window, this);
  this.windowEvents.bind('resize');
  this.windowEvents.bind('click', 'hide');
  document.body.appendChild(this.clone);
  return this;
};

Zoom.prototype.tester = function(e){
  console.log('hiya');
}

// Debounce this?
Zoom.prototype.onresize = function(){
  this.determineZoomedSize();
  this.updateStyles();
};

// optional padding?
Zoom.prototype.determineZoomedSize = function(){
  // image size
  var clone = this.clone;
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

Zoom.prototype.updateStyles = function(){
  var t = this.target;
  var s = this.clone.style;
  s.width = t.w + 'px';
  s.height = t.h + 'px';
  s.left = t.x + 'px';
  s.top = t.y + 'px';
}

Zoom.prototype.setOriginalDeminsions = function(){
  var o = this.origin;
  var t = this.target;
  this.updateStyles();

  if (transform){
    var scale = o.w / t.w;
    var translateX = (o.x + (o.w / 2)) - (t.x + (t.w / 2));
    var translateY = (o.y + (o.h / 2)) - (t.y + (t.h / 2));
    var translate3d = translateString(translateX, translateY);
    var scale = ' scale('+ scale +')';
    this.clone.style[transform] = translate3d + scale;
  }
  return this;
};


Zoom.prototype.setTargetPosition = function(){
  if (transform){
    this.clone.style[transform] = translateString(0, 0) + ' scale(1)';
  }
  return this;
}

Zoom.prototype.show = function(e){
  if (e) e.preventDefault();
  this.getDimensions();
  var self = this;
  this.loadImage(function(){
    self.emit('showing');
    if (self._overlay) {
      self._overlay.show();
    }
    self.determineZoomedSize();
    self.setOriginalDeminsions();
    self.appendClone();
    self.thumb.style.opacity = 0;
    redraw(self.clone);
    self.setTargetPosition();
    afterTransition.once(self.clone, function(){
      self.emit('shown');
    });
  });
};

Zoom.prototype.hide = function(e){
  if (e) e.preventDefault();
  this.windowEvents.unbind();
  this.setOriginalDeminsions();
  var self = this;
  self.emit('hiding');
  if (self._overlay) {
    self._overlay.hide();
  }
  afterTransition.once(self.clone, function(){
    self.thumb.style.opacity = 1;
    self.clone.parentNode.removeChild(self.clone);
    self.emit('hidden');
  });
  return this;
}


});














require.alias("component-classes/index.js", "image-zoom/deps/classes/index.js");
require.alias("component-classes/index.js", "classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-emitter/index.js", "image-zoom/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-transform-property/index.js", "image-zoom/deps/transform-property/index.js");
require.alias("component-transform-property/index.js", "transform-property/index.js");

require.alias("ianstormtaylor-redraw/index.js", "image-zoom/deps/redraw/index.js");
require.alias("ianstormtaylor-redraw/index.js", "redraw/index.js");

require.alias("component-events/index.js", "image-zoom/deps/events/index.js");
require.alias("component-events/index.js", "events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("component-matches-selector/index.js", "discore-closest/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("discore-closest/index.js", "discore-closest/index.js");
require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("anthonyshort-after-transition/index.js", "image-zoom/deps/after-transition/index.js");
require.alias("anthonyshort-after-transition/index.js", "image-zoom/deps/after-transition/index.js");
require.alias("anthonyshort-after-transition/index.js", "after-transition/index.js");
require.alias("anthonyshort-has-transitions/index.js", "anthonyshort-after-transition/deps/has-transitions/index.js");
require.alias("anthonyshort-has-transitions/index.js", "anthonyshort-after-transition/deps/has-transitions/index.js");
require.alias("anthonyshort-has-transitions/index.js", "anthonyshort-has-transitions/index.js");
require.alias("anthonyshort-css-emitter/index.js", "anthonyshort-after-transition/deps/css-emitter/index.js");
require.alias("component-emitter/index.js", "anthonyshort-css-emitter/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-event/index.js", "anthonyshort-css-emitter/deps/event/index.js");

require.alias("anthonyshort-after-transition/index.js", "anthonyshort-after-transition/index.js");
require.alias("ianstormtaylor-is/index.js", "image-zoom/deps/is/index.js");
require.alias("ianstormtaylor-is/index.js", "is/index.js");
require.alias("component-type/index.js", "ianstormtaylor-is/deps/type/index.js");

require.alias("ianstormtaylor-is-empty/index.js", "ianstormtaylor-is/deps/is-empty/index.js");

require.alias("bmcmahen-scale-to-bounds/index.js", "image-zoom/deps/scale-to-bounds/index.js");
require.alias("bmcmahen-scale-to-bounds/index.js", "image-zoom/deps/scale-to-bounds/index.js");
require.alias("bmcmahen-scale-to-bounds/index.js", "scale-to-bounds/index.js");
require.alias("bmcmahen-scale-to-bounds/index.js", "bmcmahen-scale-to-bounds/index.js");
require.alias("bmcmahen-viewport/index.js", "image-zoom/deps/viewport/index.js");
require.alias("bmcmahen-viewport/index.js", "image-zoom/deps/viewport/index.js");
require.alias("bmcmahen-viewport/index.js", "viewport/index.js");
require.alias("bmcmahen-viewport/index.js", "bmcmahen-viewport/index.js");
require.alias("component-has-translate3d/index.js", "image-zoom/deps/has-translate3d/index.js");
require.alias("component-has-translate3d/index.js", "has-translate3d/index.js");
require.alias("component-transform-property/index.js", "component-has-translate3d/deps/transform-property/index.js");

require.alias("eugenicsarchivesca-overlay/index.js", "image-zoom/deps/overlay/index.js");
require.alias("eugenicsarchivesca-overlay/index.js", "overlay/index.js");
require.alias("component-classes/index.js", "eugenicsarchivesca-overlay/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-emitter/index.js", "eugenicsarchivesca-overlay/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-delegate/index.js", "image-zoom/deps/delegate/index.js");
require.alias("component-delegate/index.js", "delegate/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("component-matches-selector/index.js", "discore-closest/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("discore-closest/index.js", "discore-closest/index.js");
require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("image-zoom/index.js", "image-zoom/index.js");if (typeof exports == "object") {
  module.exports = require("image-zoom");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("image-zoom"); });
} else {
  this["imagezoom"] = require("image-zoom");
}})();