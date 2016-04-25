var DubBotBase = require("dubbotbase");

var LOG = new DubBotBase.Log("HelpCommand");

function handler(event, globalObject) {
    LOG.info("Help command was called by {}", event.username);
    globalObject.bot.sendChat("EmancipatorBot 2.0's help can be found here: https://github.com/chrishayesmu/EmancipatorBot/wiki/Help");
}

module.exports = {
    handler: handler,
    triggers: [ "help", "info" ]
}
