var DubBotBase = require("dubbotbase");

var MysqlDao = require("../src/db/MysqlDao");

var LOG = new DubBotBase.Log("OrdinaryFellaCommand");

var dao;

function init(globalObject) {
    dao = new MysqlDao(globalObject.config.Emancipator.mysql);
}

function handler(event, globalObject) {
    var bot = globalObject.bot;
    var username;

    // Stats is run for a specific user if provided, or else for the user who ran the command
    if (event.args && event.args.length > 0) {
        username = event.args.join(" ");

        if (username.indexOf("@") === 0) {
            username = username.substring(1);
        }
    }
    else {
        username = event.username;
    }

    dao.findUsersWithSimilarName(username).then(function(users) {
        if (users.length === 0) {
            bot.sendChat("No one was found with a name like '{}'.", username);
            return;
        }

        var requestedUser = users.find(function(user) { return user.username.toLowerCase() === username.toLowerCase(); });

        if (!requestedUser) {
            // Limit the number of users we output to avoid spamming chat
            if (users.length > 5) {
                users.length = 5;
            }

            var possibleUsernames = users.map(function(user) { return user.username; }).join(", ");
            bot.sendChat("No one was found with the name '{}'. Did you mean one of these? {}", username, possibleUsernames);
            return;
        }

        dao.getIncomingVotesForUser(requestedUser.userID).then(function(incomingVotesObj) {
            var incomingUpdubPercentage = _calculateUpdubPercentage(incomingVotesObj);
            var isAboveThreshold = (incomingUpdubPercentage >= globalObject.config.Emancipator.OrdinaryFella.updubPercentageThreshold);
            var message;

            if (isAboveThreshold) {
                message = "YOU'RE NOT AN ORDINARY FELLA!";
            }
            else {
                message = "YOU'RE ONE ORDINARY FELLA!";
            }

            bot.sendChat("@" + username + " " + message);
        });
    });
}

function _calculateUpdubPercentage(votesObj) {
    var percentage = 0.0;
    if (votesObj.updubs > 0) {
        percentage = votesObj.updubs / (votesObj.updubs + votesObj.downdubs);
    }

    // Round to one decimal place
    return Math.round(percentage * 1000) / 10;
}

module.exports = {
    handler: handler,
    init: init,
    triggers: [ "fella" ]
}
