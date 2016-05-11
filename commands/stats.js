var DubBotBase = require("dubbotbase");

var MysqlDao = require("../src/db/MysqlDao");

var LOG = new DubBotBase.Log("StatsCommand");

var dao;
var statsUrl;

function init(globalObject) {
    var serverConfig = globalObject.config.Emancipator.HttpServer;
    dao = new MysqlDao(globalObject.config.Emancipator.mysql);

    statsUrl = "http://" + serverConfig.hostname;
    if (serverConfig.port != 80) {
        statsUrl = statsUrl + ":" + serverConfig.port;
    }

    statsUrl = statsUrl + "/stats/{{userId}}";
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

        var promises = [
            dao.getIncomingVotesForUser(requestedUser.userID),
            dao.getVotesCastByUser(requestedUser.userID),
            dao.getNumberOfPlaysByUser(requestedUser.userID),
            dao.getNumberOfDistinctPlaysByUser(requestedUser.userID)
        ];

        Promise.all(promises).then(function(values) {
            var incomingVotesObj = values[0];
            var votesCastObj = values[1];
            var numberOfPlays = values[2];
            var numberOfDistinctPlays = values[3];

            var incomingUpdubPercentage = _calculateUpdubPercentage(incomingVotesObj);
            var outgoingUpdubPercentage = _calculateUpdubPercentage(votesCastObj);
            var userUrl = statsUrl.replace("{{userId}}", requestedUser.userID);

            bot.sendChat("{} has played {} songs ({} unique) to EmancipatorBot, receiving {} updubs and {} downdubs ({}% updub rate).",
                          requestedUser.username, numberOfPlays, numberOfDistinctPlays, incomingVotesObj.updubs, incomingVotesObj.downdubs, incomingUpdubPercentage);

            bot.sendChat("{} has cast {} updubs and {} downdubs ({}% updub rate).",
                          requestedUser.username, votesCastObj.updubs, votesCastObj.downdubs, outgoingUpdubPercentage);

            bot.sendChat("View more at {}", userUrl);
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
    triggers: [ "stats" ]
}
