var PlugBotBase = require("PlugBotBase");

var LOG = new PlugBotBase.Log("DuplicatePlayDetection");

var MILLISECONDS_IN_TWO_HOURS = 2 * 60 * 60 * 1000;

function handleAdvanceEvent(event, globalObject) {
    var playsOfSameVideo = globalObject.roomState.findPlaysForContentId(event.media.contentID);
    var now = Date.now();

    for (var i = 0; i < playsOfSameVideo.length; i++) {
        var play = playsOfSameVideo[i];
        var timeSincePlay = now - play.startDate;

        // Make sure timeSincePlay > 0; otherwise we're actually looking at the currently playing song
        if (timeSincePlay > 0 && timeSincePlay <= MILLISECONDS_IN_TWO_HOURS) {
            globalObject.bot.sendChat("This song was played less than 2 hours ago by {}", play.user.username);
            return;
        }
    }
}

module.exports[PlugBotBase.Event.ADVANCE] = handleAdvanceEvent;
