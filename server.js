#!/usr/bin/env node

var chalk = require('chalk');
var etherpad = require('./lib/etherpad');
var irc = require('irc');

var getWhimsy = etherpad.load('urlbar-sayings');

var handleMessage = function (from, to, message) {
  if (!message) {
    message = to;
    to = from;
  }
  var reply;
  var logMessage;
  if (/http.*\.gif/.test(message)) {
    logMessage = 'Got ';
    if (from === to) {
      logMessage += 'private ';
    }
    logMessage += 'gif from ' + chalk.blue.bold(from) + ': ' +
      message.replace(/^whimsybot:/, '').trim();
    reply = 'Gif submitted.  Thanks!  :)';
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
    channels: ['#whimsy'],
    secure: true,
    port: 6697
  });

  bot.addListener('message', function(from, to, message) {
    if (to === 'whimsybot' && from !== 'whimsybot') {
      handleMessage(from, message);
    } else if (/whimsybot/.test(message)) {
      handleMessage(from, to, message);
    }
  });

  bot.addListener('error', function(message) {
    console.log('error: ', message);
  });
}
