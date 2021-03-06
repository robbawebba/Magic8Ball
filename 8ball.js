var Botkit = require('botkit');
var fs = require('fs');
var hash = require('string-hash');
var http = require('http')

var responses = ["It is certain",
"It is decidedly so",
"Without a doubt",
"Yes, definitely",
"You may rely on it",
"As I see it, yes",
"Most likely",
"Outlook good",
"Yes",
"Signs point to yes",
"Reply hazy try again",
"Ask again later",
"Better not tell you now",
"Cannot predict now",
"Concentrate and ask again",
"Don't count on it",
"My reply is no",
"My sources say no",
"Outlook not so good",
"Very doubtful"];

http.createServer(function (request, response) {
  response.writeHead(200);
  response.end();
}).listen(process.env.PORT || 5000)


var controller = Botkit.slackbot({
  debug: process.env.debug,
});
var bot;
var token;

if (process.env.TOKEN_PATH) {
  // Load slack token from file
  fs.readFile(process.env.TOKEN_PATH, function (err, data) {
    if (err) {
      console.log('Error: Specify token in token_path file: '+ err)
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
} else if(process.env.TOKEN) {
    data = process.env.TOKEN
    data = data.replace(/\s/g, '')

    bot = controller.spawn({
      token: data
    }).startRTM(function (err) {
      if (err) {
        throw new Error(err)
      }
    });

    token = data;
} else {
  console.log('Error: Specify TOKEN or TOKEN_PATH in environment');
  process.exit(1);
}


controller.hears(['hello', '(^hi)'], 'direct_message,direct_mention,mention', function (bot, message) {

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

controller.hears(['(.*\\?)'], 'direct_message,direct_mention,mention', function (bot, message) {
    bot.botkit.log(message.text)
    bot.reply(message, prediction(message.text));
});

// choose a response based on the hash of the user input
// Future direction: choose response based on a hash of user's input?
function prediction(text) {
  text = text + String(Date.now()); // Adds the time to help randomize the hash
  rand = hash(text) % responses.length;
  bot.botkit.log(rand);
  return String(responses[rand]);
}