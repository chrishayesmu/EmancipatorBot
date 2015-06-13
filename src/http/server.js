var consolidate = require("consolidate");
var express = require("express");
var Log = require("plugbotbase").Log;
var Mustache = require("mustache");
var SqliteDao = require("../db/SqliteDao");

var LOG = new Log("HttpServer");

var app;
var dao;

function start(globalObject) {
    var hostname = globalObject.config.Emancipator.HttpServer.hostname;
    var port = globalObject.config.Emancipator.HttpServer.port;

    dao = SqliteDao.getInstance(globalObject.config.Emancipator.databaseFile);

    LOG.info("Attempting to start HTTP server ..");
    app = express();
    app.engine("html", consolidate.mustache);
    app.set("view engine", "html");
    app.set("views", __dirname + "/views");
    app.use(express.static(__dirname + "/css"));
    app.use(express.static(__dirname + "/js"));
    app.use(express.static(__dirname + "/lib"));

    app.get("/stats/:userID/", handleStatsRequest);

    app.listen(port);
    LOG.info("Started HTTP server listening on hostname {} and port {}", hostname, port);
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

        if (!incomingVotesObj || !votesCastObj || !numberOfPlays || !requestedUser) {
            response.send("No user found with ID " + userID);
            return;
        }

        // TODO: keep raw data here and move all the processing to UI
        var barGraphBase = [
            [ "User", "Woots", "Mehs" ]
        ];

        var outgoingVotesBarGraphData = barGraphBase.concat(groupVoteData(votesCastObj));
        var incomingVotesBarGraphData = barGraphBase.concat(groupVoteData(incomingVotesObj));

        response.render("stats", {
            incomingVotes: JSON.stringify(incomingVotesObj),
            incomingVotesBarGraphData: JSON.stringify(incomingVotesBarGraphData),
            incomingVotesObj: incomingVotesObj,
            numberOfPlays: numberOfPlays,
            outgoingVotes: JSON.stringify(votesCastObj),
            outgoingVotesBarGraphData: JSON.stringify(outgoingVotesBarGraphData),
            outgoingVotesObj: votesCastObj,
            userID: userID,
            username: requestedUser.username
        });
    });
}

function groupVoteData(votes) {
    var data = {};

    votes.votes.forEach(function(vote) {
        if (!data[vote.userID]) {
            data[vote.userID] = {
                username: vote.username,
                userID: vote.userID,
                woots: 0,
                mehs: 0
            };
        }

        if (vote.vote === 1) {
            data[vote.userID].woots++;
        }
        else {
            data[vote.userID].mehs++;
        }
    });

    var arr = [];
    Object.keys(data).forEach(function(key) {
        arr.push(data[key]);
    });

    arr = arr.sort(function(item1, item2) {
        return (item2.woots + item2.mehs) - (item1.woots + item1.mehs);
    });

    // Take only the top 10 users and turn them into an array appropriate for graphing
    var output = [];
    for (var i = 0; i < 10 && i < arr.length; i++) {
        output.push([
            arr[i].username,
            arr[i].woots,
            arr[i].mehs
        ]);
    }

    return output;
}

exports.start = start;
