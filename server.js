#!/usr/bin/env node

var chalk = require('chalk');
var etherpad = require('./lib/etherpad');
var fs = require('fs');
var irc = require('irc');

var getWhimsy = etherpad.load('urlbar-sayings');
var submitted = new Set();
var GIF_FILE = '/Dropbox/Downloads/Whimsy/submitted_gifs.txt';
var gifs = fs.readFileSync(GIF_FILE, {encoding: 'utf8'});
for (var line of gifs.split('\n')) {
  var index = line.indexOf(': ');
  if (index != -1) {
    submitted.add(line.slice(index+2).trim());
  }
}
for (var item of submitted) console.log(item);

var handleMessage = function (from, to, message) {
  if (!message) {
    message = to;
    to = from;
  }
  var reply = "";
  var logMessage;
  if (/http.*\.gif/.test(message)) {
    logMessage = 'Got ';
    message = message.trim();
    if (!submitted.has(message)) {
      logMessage += chalk.red.bold('new ');
    }
    if (from === to) {
      logMessage += 'private ';
    }
    logMessage += 'gif from ' + chalk.blue.bold(from) + ': ' +
      message.replace(/^whimsybot:/, '').trim();
    if (from === to || /whimsybot/.test(message)) {
      reply = 'Gif submitted.  Thanks!  :)';
    }
    if (!submitted.has(message)) {
      fs.appendFile(GIF_FILE, from + ': ' + message + '\n', function (err) {
        if (err) {
          console.log('gif error: ', err);
        }
        submitted.add(message);
      });
    }
  } else {
    reply = getWhimsy();
    if (from !== to) {
      logMessage = 'In '  + chalk.red.bold(to);
    } else {
      logMessage = 'Privately';
    }
    logMessage += ' telling ' + chalk.blue.bold(from) +
      chalk.yellow(' "' + reply + '"') + '.';
  }
  console.log(logMessage);
  bot.say(to, reply);
}

if (!module.parent) {
  var bot = new irc.Client('irc.mozilla.org', 'whimsybot', {
    channels: ['#whimsy', '#animatedgifs'],
    secure: true,
    port: 6697
  });

  bot.addListener('message', function(from, to, message) {
    if (to === 'whimsybot' && from !== 'whimsybot') {
      handleMessage(from, message);
    } else if (/http.*\.gif/.test(message)) {
      handleMessage(from, to, message);
    } else if (/^whimsybot: /.test(message)) {
      handleMessage(from, to, message);
    }
  });

  bot.addListener('error', function(message) {
    console.log('error: ', message);
  });
}
