var DubBotBase = require("dubbotbase");

var LOG = new DubBotBase.Log("RollCommand");

function handler(event, globalObject) {

    if (!event.args || event.args.length === 0) {
        return;
    }

    var numDice = convertArgToInteger(event.args[0]);
    var minInclude = 1;
    var maxInclude = 100;

    if (numDice === null || numDice <= 0) {
        return;
    }

    if (numDice > 6) {
        globalObject.bot.sendChat("@{}: can't roll more than 6 dice at once", event.username);
        return;
    }

    if (event.args.length === 2) {
        var secondArg = convertArgToInteger(event.args[1]);

        if (secondArg !== null) {
            maxInclude = secondArg;
        }
    }
    else if (event.args.length === 3) {
        var secondArg = convertArgToInteger(event.args[1]);
        var thirdArg = convertArgToInteger(event.args[2]);

        if (secondArg !== null) {
            minInclude = secondArg;
        }

        if (thirdArg !== null) {
            maxInclude = thirdArg;
        }
    }

    if (minInclude > maxInclude) {
        globalObject.bot.sendChat("@{}: can't roll numbers between {} and {}", event.username, minInclude, maxInclude);
        return;
    }

    var randomInts = [];

    for (var i = 0; i < numDice; i++) {
        var value = getRandomInt(minInclude, maxInclude);
        randomInts.push(value);
    }

    var randomIntsString = randomInts.join(", ");
    globalObject.bot.sendChat("Rolled [{}] for {} (from {} - {})", randomIntsString, event.username, minInclude, maxInclude);
}

// From MDN Math.random documentation
function getRandomInt(minInclude, maxInclude) {
    return Math.floor(Math.random() * (maxInclude - minInclude + 1)) + minInclude;
}

function convertArgToInteger(arg) {
    if (!Number.isInteger(Number(arg))) {
        return null;
    }

    return Number(arg);
}

module.exports = {
    handler: handler,
    triggers: [ "rolln", "rolltuple", "rollmany" ]
}
