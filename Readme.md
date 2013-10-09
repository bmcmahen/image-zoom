
# image-zoom

  Take a thumbnail, and zoom it to fit the screen. It uses transforms for buttery smoothness, but should still work on older browsers.

## Installation

    $ component install bmcmahen/image-zoom

or use the standalone version in `standalone`, with the global variable `imagezoom`.

## API

You can use markup (much like Bootstrap) for initiating zoom on certain elements.

```html
<img class='thumb' src='inst6.jpg' data-zoom-url='inst6.jpg' data-zoom-overlay='true'>
<script>
var zoom = require('image-zoom');
</script>
```

Or you can use the javascript API, like in the example below.

```html
<img class='thumb' src='inst6.jpg'>

<script>
var zoom = require('image-zoom');
var z = new zoom(document.querySelector('img'), 'inst6.jpg');
</script>
```

### Zoom.show()
### Zoom.hide()

## Events

### showing
### shown
### hiding
### hidden

```javascript
var zoom = require('image-zoom');
var z = new zoom(document.querySelector('img'), 'inst6.jpg');
z.on('shown', function(){
  // our element is zoomed in
});
```


## License

  MIT
