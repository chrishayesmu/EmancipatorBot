var PlugBotBase = require("plugbotbase");

var SqliteDao = require("../src/db/SqliteDao");

var LOG = new PlugBotBase.Log("StatsCommand");

var dao;

function init(globalObject) {
    dao = SqliteDao.getInstance(globalObject.config.Emancipator.databaseFile);
}

function handler(event, globalObject) {
    dao.getNumberOfIncomingVotesForUser(event.userID).then(function(incomingVotesObj) {
        dao.getNumberOfVotesCastByUser(event.userID).then(function(votesCastObj) {
            dao.getNumberOfPlaysByUser(event.userID).then(function(numberOfPlays) {
                var bot = globalObject.bot;
                var incomingWootPercentage = _calculateWootPercentage(incomingVotesObj);
                var outgoingWootPercentage = _calculateWootPercentage(votesCastObj);

                bot.sendChat("{} has played {} songs to EmancipatorBot, receiving {} woots and {} mehs ({}% woot rate).",
                              event.username, numberOfPlays, incomingVotesObj.woots, incomingVotesObj.mehs, incomingWootPercentage);

                bot.sendChat("{} has cast {} woots and {} mehs ({}% woot rate).",
                              event.username, votesCastObj.woots, votesCastObj.mehs, outgoingWootPercentage);
            });
        });
    });
}

function _calculateWootPercentage(votesObj) {
    var percentage = 0.0;
    if (votesObj.woots > 0) {
        percentage = votesObj.woots / (votesObj.woots + votesObj.mehs);
    }

    // Round to one decimal place
    return Math.round(percentage * 1000) / 10;
}

module.exports = {
    handler: handler,
    init: init,
    triggers: [ "stats" ]
}
