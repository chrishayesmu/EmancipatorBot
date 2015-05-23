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
    LOG.info("Waiting {} milliseconds to (potentially) skip", timeToWaitBeforeSkippingInMs);

    setTimeout(function() {
        var bot = globalObject.bot;
        var currentSong = globalObject.roomState.playHistory[0].media;

        if (currentSong.contentID === mediaContentID) {
            bot.sendChat("The current song is bugged and should have ended.");

            if (globalObject.config.Emancipator.AutoSkipBuggedSongs.forceSkipBuggedSongs) {
                bot.forceSkip();
            }
        }
    }, timeToWaitBeforeSkippingInMs);
}

module.exports[PlugBotBase.Event.ADVANCE] = handleAdvanceEvent;
