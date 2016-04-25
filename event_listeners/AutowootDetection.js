var DubBotBase = require("dubbotbase");

var LOG = new DubBotBase.Log("AutowootDetection");

function handleVoteEvent(event, globalObject) {
    if (globalObject.config.Emancipator.AutowootDetection.ignoreAutowooting) {
        return;
    }

    var autowootDurationInMilliseconds = globalObject.config.Emancipator.AutowootDetection.autowootDurationInMilliseconds;
    var currentPlay = globalObject.roomState.playHistory[0];
    var now = Date.now();

    if (event.vote === 1 && now - currentPlay.localStartDate < autowootDurationInMilliseconds) {
        var autowooter = globalObject.roomState.findUserInRoomById(event.userID);
        LOG.info("Found autowooting by {} (userID = {})", autowooter.username, autowooter.userID);
        globalObject.bot.sendChat("@{} Auto-wooting is not allowed in this room. Please disable your autowoot script.", autowooter.username);
    }
}

module.exports[DubBotBase.Event.VOTE] = handleVoteEvent;
