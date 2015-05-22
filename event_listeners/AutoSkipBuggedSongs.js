/**
 * Detects when plug is being broken and failing to advance songs.
 * Can optionally force skip the broken song.
 */

var PlugBotBase = require("plugbotbase");

var LOG = new PlugBotBase.Log("AutoSkipBuggedSongs");

function handleAdvanceEvent(event, globalObject) {
    var timeToWaitInSeconds = globalObject.config.Emancipator.AutoSkipBuggedSongs.timeToWaitInSeconds;
    var timeToWaitBeforeSkippingInMs = (event.media.durationInSeconds + timeToWaitInSeconds) * 1000;
    var mediaContentID = event.media.contentID;

    setTimeout(function() {
        var currentSong = globalObject.roomState.playHistory[0];

        if (currentSong.contentID === mediaContentID) {
            bot.sendChat("The current song appears to be bugged and should have already ended.");

            if (globalObject.config.Emancipator.AutoSkipBuggedSongs.forceSkipBuggedSongs) {
                bot.forceSkip();
            }
        }
    }, timeToWaitBeforeSkippingInMs);
}

module.exports[PlugBotBase.Event.ADVANCE] = handleAdvanceEvent;
