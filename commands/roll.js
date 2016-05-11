var DubBotBase = require("dubbotbase");

var LOG = new DubBotBase.Log("RollCommand");

function handler(event, globalObject) {
    LOG.info("Roll command was called by {}", event.username);

    var minInclude = 1;
    var maxInclude = 100;

    if (event.args && event.args.length === 1) {
        var firstArg = convertArgToInteger(event.args[0]);

        if (firstArg !== null) {
            maxInclude = firstArg;
        }
    }
    else if (event.args && event.args.length === 2) {
        var firstArg = convertArgToInteger(event.args[0]);
        var secondArg = convertArgToInteger(event.args[1]);

        if (firstArg !== null) {
            minInclude = firstArg;
        }

        if (secondArg !== null) {
            maxInclude = secondArg;
        }
    }

    if (minInclude > maxInclude) {
        globalObject.bot.sendChat("Can't roll a number between {} and {}", minInclude, maxInclude);
    }
    else {
        var randomInt = getRandomInt(minInclude, maxInclude);
        globalObject.bot.sendChat("Rolled {} (from {} - {})", randomInt, minInclude, maxInclude);
    }
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
    triggers: [ "roll", "dice" ]
}
