
# image-zoom

  Zoom an image to full-screen, as seen on Medium.com. It uses transforms for buttery smoothness, but should still work on older browsers given polyfills for classList. [Demo here](http://benmcmahen.com/image-zoom/index.html)

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
var zoom = require('image-zoom');

// listen for clicks
var el = document.querySelector('img');
el.onclick = zoomImage;

function zoomImage(e){
  zoom(e.target)
    .overlay() // enable overlay
    .padding(20) // enable padding of 20. defaults to 0
    .show();
}

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

```javascript
var zoom = require('image-zoom');
var z = zoom(document.querySelector('img'), 'inst6.jpg');
z.on('shown', function(){
  // our element is zoomed in
});
```


## License

  MIT
