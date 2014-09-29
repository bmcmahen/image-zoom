var fs = require('fs');
var path = require('path');
var request = require('request');
var jade = require('jade');

var string = fs.readFileSync(path.join(__dirname, 'index.jade'), 'utf8')
var template = jade.compile(string)

var IMGUR_CLIENT_ID = 'f0ea04148a54268';
var opts= {
  headers: { 'Authorization': 'Client-ID ' + IMGUR_CLIENT_ID },
  url: 'https://api.imgur.com/3/gallery/t/beauty'
};

request(opts, function (err, res, body) {
  if (err) throw err;

  var json = JSON.parse(body);
  var images = json.data.items;
  console.log(images);

  fs.writeFileSync(
    path.join(__dirname, '..', 'demo.html'),
    template({
      images: images
    })
  )

  process.exit()
});
