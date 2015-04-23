var PlugBotBase = require("PlugBotBase");

var LOG = new PlugBotBase.Log("DatabaseTracking");

function handleVoteEvent(event, globalObject) {
    var currentPlay = globalObject.roomState.playHistory[0];
    var now = Date.now();

    if (event.vote === 1 && now - currentPlay.startDate < 2000) { // TODO make configuration-driven
        var autowooter = globalObject.roomState.findUserInRoomById(event.userID);
        globalObject.bot.sendChat("@{} Auto-wooting is not allowed in this room. Please disable your autowoot script.", autowooter.username);
    }
}

module.exports[PlugBotBase.Event.VOTE] = handleVoteEvent;
