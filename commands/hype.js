var PlugBotBase = require("plugbotbase");

function handler(event, globalObject) {
    var bot = globalObject.bot;

    bot.sendChat("http://i.imgur.com/PSCIRCR.png");
}

module.exports = {
    handler: handler,
    triggers: [ "e3", "hype" ]
}
