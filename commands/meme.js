var memes;

function init(globalObject) {
    memes = require("./data/memes.json");
}

function handler(event, globalObject) {
    var bot = globalObject.bot;
    var index;

    if (event.args && event.args.length > 0 && Number.isInteger(Number(event.args[0]))) {
        index = Number(event.args[0]) - 1; // argument is provided as 1-indexed
    }
    else {
        index = getRandomInt(0, memes.length);
    }

    var totalMemes = memes.length;
    var memeNumber = index + 1;

    if (index >= memes.length || index < 0) {
        bot.sendChat("Meme {} doesn't exist; memes go from 1 to {}", memeNumber, totalMemes);
    }
    else {
        bot.sendChat("Meme {} out of {} {}", memeNumber, totalMemes, memes[index]);
    }
}

function getRandomInt(minInclusive, maxExclusive) {
    return Math.floor(Math.random() * (maxExclusive - minInclusive)) + minInclusive;
}

module.exports = {
    handler: handler,
    init: init,
    triggers: [ "meme", "memes" ]
}
