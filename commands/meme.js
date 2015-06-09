var PlugBotBase = require("plugbotbase");

var memes;

function init(globalObject) {
    memes = require("./data/memes.json");
}

function handler(event, globalObject) {
    var bot = globalObject.bot;
    var index = getRandomInt(0, memes.length);

    bot.sendChat(memes[index]);
}

function getRandomInt(minInclusive, maxExclusive) {
    return Math.floor(Math.random() * (maxExclusive - minInclusive)) + minInclusive;
}

module.exports = {
    handler: handler,
    init: init,
    triggers: [ "meme", "memes" ]
}
