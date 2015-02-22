var request = require('request'),
  _ = require('underscore');

exports.load = function etherpad_load(name) {
  var url = 'https://raw.github.com/bwinton/whimsy/gh-pages/' + name + '.txt';
  var whimsies = ['Hold on a second there, pilgrim!'];
  var updateWhimsies = function updateWhimsies() {
    console.log("Updating whimsies…");
    request.get( url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var lines = body.split("\n");
        var incoming = _.filter(lines, function(line) {
          return (! /^\#/.test(line) && line.trim().length > 0)
        });
        if (incoming.length) {
          console.log("Got " + incoming.length + " whimsies.");
          whimsies = incoming;
        }
      }
    });
    setTimeout(updateWhimsies, 4*60*60*1000);
  };
  updateWhimsies();
  return function getWhimsy() {
    var rand = Math.round(Math.random() * whimsies.length);
    return whimsies[rand];
  };
}
