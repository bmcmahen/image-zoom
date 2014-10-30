
# image-zoom

Zoom an image to full-screen, as seen on Medium.com. It uses transforms for buttery smoothness, but should still work on older browsers given polyfills for classList & bind. [Demo here](http://benmcmahen.com/image-zoom/index.html)

## Installation

  Install using [Duo](http://github.com/duojs/duo)

```
var Zoom = require('bmcmahen/image-zoom');
```

  or use the standalone build in `dist` using the global `Imagezoom`.

## API

You can use markup (much like Bootstrap) for initiating zoom on certain elements.

```html
<img class='thumb' src='inst6.jpg' data-zoom-padding='20' data-zoom-url='inst6.jpg' data-zoom-overlay='true'>
<script src='imagezoom.js'></script>
```

Or you can use the javascript API, like in the example below.

```html
<img class='thumb' src='inst6.jpg'>

<script>
var ImageZoom = require('image-zoom');

var img = document.querySelector('img');
var zoom = new Imagezoom(img).overlay().padding(350);

img.onclick = function(e){
  // stop propagation if we want to retain our HTML api
  // in other parts of the site.
  e.stopPropagation();
  zoom2.show();
};

// unbind our delegate listener if we aren't
// using the HTML api.
zoom.stopListening();

</script>
```

### .show()

Zoom in.

### .hide()

Zoom out.

### .overlay()

Enable the overlay when zooming into the image.

### .padding(num)

Set the padding of the zoomed image.

### .use(plugin)

Use a plugin.

## Events

### showing
### shown
### hiding
### hidden
### cancel

```javascript
var zoom = require('image-zoom');
var z = zoom(document.querySelector('img'));
z.on('shown', function(){
  // our element is zoomed in
});
```


## License

  MIT
