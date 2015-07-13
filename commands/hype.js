var PlugBotBase = require("plugbotbase");

function handler(event, globalObject) {
    var bot = globalObject.bot;

    bot.sendChat("http://i.imgur.com/YS2f9B2.png");
}

module.exports = {
    handler: handler,
    triggers: [ "evo", "hype" ]
}
