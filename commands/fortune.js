var exec = require('child_process').exec;

var PlugBotBase = require("PlugBotBase");

var LOG = new PlugBotBase.Log("FortuneCommand");

function handler(event, globalObject) {
    LOG.info("Fortune command was called by {}", event.username);
    exec("fortune -s -o", function(err, stdout, stderr) {
        globalObject.bot.sendChat(stdout);
    });
}

module.exports = {
    handler: handler,
    triggers: [ "fortune", "wisdom" ]
}
