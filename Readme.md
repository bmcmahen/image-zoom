
# image-zoom

  Take a thumbnail, and zoom it to fit the screen. It uses transforms for buttery smoothness, but should still work on older browsers. [Demo here](http://benmcmahen.com/image-zoom/index.html)

## Installation

    $ component install bmcmahen/image-zoom

or use the standalone version in `standalone`, with the global variable `imagezoom`.

## API

You can use markup (much like Bootstrap) for initiating zoom on certain elements.

```html
<img class='thumb' src='inst6.jpg' data-zoom-padding='20' data-zoom-url='inst6.jpg' data-zoom-overlay='true'>
<script>
var zoom = require('image-zoom');
</script>
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
