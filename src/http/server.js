var consolidate = require("consolidate");
var express = require("express");
var Log = require("plugbotbase").Log;
var Mustache = require("mustache");
var SqliteDao = require("../db/SqliteDao");

var LOG = new Log("HttpServer");

var app;
var dao;

function start(globalObject) {
    dao = SqliteDao.getInstance(globalObject.config.Emancipator.databaseFile);

    app = express();
    app.engine("html", consolidate.mustache);
    app.set("view engine", "html");
    app.set("views", __dirname + "/views");
    app.use(express.static(__dirname + "/css"));
    app.use(express.static(__dirname + "/js"));
    app.use(express.static(__dirname + "/lib"));

    app.get("/stats/:userID/", handleStatsRequest);

    app.listen(8080);
}

function handleStatsRequest(request, response) {
    var userID = request.params.userID;
    LOG.info("Received stats request for userID {}", userID);

    var promises = [
        dao.getNumberOfIncomingVotesForUser(userID),
        dao.getNumberOfVotesCastByUser(userID),
        dao.getNumberOfPlaysByUser(userID),
        dao.getUser(userID)
    ];

    Promise.all(promises).then(function(values) {
        var incomingVotesObj = values[0];
        var votesCastObj = values[1];
        var numberOfPlays = values[2];
        var requestedUser = values[3];

        var incomingWootPercentage = _calculateWootPercentage(incomingVotesObj);
        var outgoingWootPercentage = _calculateWootPercentage(votesCastObj);

        response.render("stats", {
            incomingVotes: incomingVotesObj,
            numberOfPlays: numberOfPlays,
            outgoingVotes: votesCastObj,
            userID: userID,
            username: requestedUser.username
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

exports.start = start;
