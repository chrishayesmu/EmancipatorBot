var consolidate = require("consolidate");
var express = require("express");
var Log = require("dubbotbase").Log;
var Mustache = require("mustache");
var MysqlDao = require("../db/MysqlDao");

var LOG = new Log("HttpServer");

var app;
var dao;
var statsUrl;
var statsHref = "<a href='{{url}}'>{{username}}</a>";

function start(globalObject) {
    var hostname = globalObject.config.Emancipator.HttpServer.hostname;
    var externalPort = globalObject.config.Emancipator.HttpServer.externalPort;
    var listenPort = globalObject.config.Emancipator.HttpServer.listenPort;
    statsUrl = createUrl(hostname, externalPort) + "/stats/{{userID}}";

    dao = new MysqlDao(globalObject.config.Emancipator.mysql);

    LOG.info("Attempting to start HTTP server ..");
    app = express();
    app.engine("html", consolidate.mustache);
    app.set("view engine", "html");
    app.set("views", __dirname + "/views");
    app.use(express.static(__dirname + "/css"));
    app.use(express.static(__dirname + "/js"));
    app.use(express.static(__dirname + "/lib"));

    app.get("/stats/:userID/", handleStatsRequest);

    app.listen(listenPort);
    LOG.info("Started HTTP server listening on hostname {} and port {}", hostname, listenPort);
}

function handleStatsRequest(request, response) {
    var userID = request.params.userID;
    LOG.info("Received stats request for userID {}", userID);

    var promises = [
        dao.getIncomingVotesForUser(userID),
        dao.getVotesCastByUser(userID),
        dao.getPlaysByUser(userID),
        dao.getUser(userID)
    ];

    Promise.all(promises).then(function(values) {
        var incomingVotesObj = values[0];
        var votesCastObj = values[1];
        var plays = values[2];
        var requestedUser = values[3];

        if (!incomingVotesObj || !votesCastObj || !plays || !requestedUser) {
            response.send("No user found with ID " + userID);
            return;
        }

        // TODO: keep raw data here and move all the processing to UI
        var barGraphBase = [
            [ "User", "Updubs", "Downdubs", { role: "annotation" } ]
        ];

        var outgoingVotesBarGraphData = barGraphBase.concat(groupVoteData(votesCastObj));
        var incomingVotesBarGraphData = barGraphBase.concat(groupVoteData(incomingVotesObj));

        response.render("stats", {
            incomingVotes: JSON.stringify(incomingVotesObj),
            incomingVotesBarGraphData: JSON.stringify(incomingVotesBarGraphData),
            incomingVotesObj: incomingVotesObj,
            numberOfPlays: plays.length,
            outgoingVotes: JSON.stringify(votesCastObj),
            outgoingVotesBarGraphData: JSON.stringify(outgoingVotesBarGraphData),
            outgoingVotesObj: votesCastObj,
            plays: JSON.stringify(plays),
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
                updubs: 0,
                downdubs: 0
            };
        }

        if (vote.vote === 1) {
            data[vote.userID].updubs++;
        }
        else {
            data[vote.userID].downdubs++;
        }
    });

    var arr = [];
    Object.keys(data).forEach(function(key) {
        arr.push(data[key]);
    });

    arr = arr.sort(function(item1, item2) {
        return (item2.updubs + item2.downdubs) - (item1.updubs + item1.downdubs);
    });

    // Take only the top 10 users and turn them into an array appropriate for graphing
    var output = [];
    for (var i = 0; i < 10 && i < arr.length; i++) {
        output.push([
            arr[i].username,
            arr[i].updubs,
            arr[i].downdubs,
            statsUrl.replace("{{userID}}", arr[i].userID)
        ]);
    }

    return output;
}

function createUrl(hostname, port) {
    var url = "http://" + hostname;
    if (port != 80) {
        url = url + ":" + port;
    }

    return url
}

function formatUsernameAsLink(username, userID) {
    var url = statsUrl.replace("{{userID}}", userID);
    return statsHref.replace("{{url}}", url).replace("{{username}}", username);
}

exports.start = start;
