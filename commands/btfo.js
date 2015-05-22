var PlugBotBase = require("plugbotbase");

var LOG = new PlugBotBase.Log("Btfo");

function handler(event, globalObject) {
    var bot = globalObject.bot;

    bot.sendChat("B T F O");
    bot.sendChat("T");
    bot.sendChat("F");
    bot.sendChat("O");
}

module.exports = {
    handler: handler,
    triggers: [ "btfo" ]
}
