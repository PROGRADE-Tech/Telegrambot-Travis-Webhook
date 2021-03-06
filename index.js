/* eslint-disable */
var http = require('http')
var fs = require('fs');
var createHandler = require('travisci-webhook-handler')
var fetch = require('node-fetch')
var request = require('request');

var handler

var conf = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));

function sendToTelegram(message) {
  var url = "https://api.telegram.org/bot"+conf.botToken+"/sendMessage"
  request.post(
    url,
    { json: {
      chat_id: conf.chatId,
      text: message,
      parse_mode: "Markdown",
      disable_web_page_preview: true
    } },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
    })
  };

if (conf.isKanna) {
  sendToTelegram("Ravioli Ravioli start the Traviswebhookloli")
} else {
  sendToTelegram("Running Travis webhook on `" + conf.path + "`")
}


fetch('https://api.travis-ci.org/config')
  .then((res) => res.text())
  .then(function(body) {
    console.log(JSON.parse(body).config.notifications.webhook.public_key);
    handler = createHandler({
      path: conf.path,
      public_key: JSON.parse(body).config.notifications.webhook.public_key
    })
    http.createServer(function (req, res) {
      handler(req, res, function (err) {
        res.statusCode = 404
        res.end('no such location')
      })
    }).listen(3000)

    handler.on('*', function (event) {
        sendToTelegram("*"+event.payload.status_message.toUpperCase()+":*\n"+"Build `"+event.payload.number+"` for `"+event.payload.repository.name+"` on branch `"+event.payload.branch+"`")
    })
  })
