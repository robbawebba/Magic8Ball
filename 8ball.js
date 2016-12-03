var Botkit = require('botkit');
var os = require('os');
var fs = require('fs');

var controller = Botkit.slackbot({
  debug: process.env.debug,
});
var bot;
var token;

if (!process.env.token_path) {
  console.log('Error: Specify token_path in environment');
  process.exit(1);
}

fs.readFile(process.env.token_path, function (err, data) {
  if (err) {
    console.log('Error: Specify token in slack_token_path file')
    process.exit(1)
  }
  data = String(data)
  data = data.replace(/\s/g, '')

  bot = controller.spawn({
    token: data
  }).startRTM(function (err) {
    if (err) {
      throw new Error(err)
    }
  });

  token = data;
})
// END: Load Slack token from file

controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function (bot, message) {

  bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'robot_face',
  }, function (err, res) {
    if (err) {
      bot.botkit.log('Failed to add emoji reaction :(', err);
    }
  });

  bot.api.users.info({
    token: token,
    user: message.user
  }, function (err, data) {
    if (err) {
      throw new Error(err)
    }
    if (data.user) {
      bot.reply(message, 'Hello ' + data.user.name + '!!');
    } else {
      bot.reply(message, 'Hello.');
    }
  })
});
