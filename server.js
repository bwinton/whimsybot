#!/usr/bin/env node

var chalk = require('chalk');
var etherpad = require('./lib/etherpad');
var irc = require('irc');

var getWhimsy = etherpad.load('urlbar-sayings');

if (!module.parent) {
  var bot = new irc.Client('irc.mozilla.org', 'whimsybot', {
    channels: ['#whimsy'],
    secure: true,
    port: 6697
  });

  bot.addListener('message', function(from, to, message) {
    var saying = getWhimsy();
    if (/whimsybot/.test(message)) {
      console.log('In '  + chalk.red.bold(to) + ' Telling ' + chalk.blue.bold(from) +
        chalk.yellow(' "' + saying + '"') + '.');
      bot.say(to, saying);
    } else if (to === 'whimsybot') {
      console.log('Privately telling ' + chalk.blue.bold(from) +
        chalk.yellow(' "' + saying + '"') + '.');
      bot.say(from, saying);
    }
  });
}
