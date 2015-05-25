/**
 * Detects when plug is being broken and failing to advance songs.
 * Can optionally force skip the broken song.
 */

var PlugBotBase = require("plugbotbase");

var LOG = new PlugBotBase.Log("AutoSkipBuggedSongs");
var ON_SKIP_MESSAGE = "This song is bugged and should have ended.";

function handleAdvanceEvent(event, globalObject) {
    var timeToWaitInSeconds = globalObject.config.Emancipator.AutoSkipBuggedSongs.timeToWaitInSeconds;
    var timeToWaitBeforeSkippingInMs = (event.media.durationInSeconds + timeToWaitInSeconds) * 1000;
    var mediaContentID = event.media.contentID;
    LOG.info("Waiting {} milliseconds to (potentially) skip", timeToWaitBeforeSkippingInMs);

    setTimeout(function() {
        var bot = globalObject.bot;
        var numberOfMessagesToCheck = globalObject.config.Emancipator.AutoSkipBuggedSongs.chatHistoryDistanceToSearch;
        var currentSong = globalObject.roomState.playHistory[0].media;
        var chatHistory = globalObject.roomState.chatHistory;

        if (currentSong.contentID === mediaContentID) {
            // Don't flood the chat with the message
            var isMessageAlreadyInRecentHistory = false;
            for (var i = 0; i < chatHistory.length && i < numberOfMessagesToCheck; i++) {
                if (chatHistory[i].message === ON_SKIP_MESSAGE) {
                    isMessageAlreadyInRecentHistory = true;
                    break;
                }
            }

            if (!isMessageAlreadyInRecentHistory) {
                bot.sendChat(ON_SKIP_MESSAGE);
            }

            if (globalObject.config.Emancipator.AutoSkipBuggedSongs.forceSkipBuggedSongs) {
                bot.forceSkip();
            }
        }
    }, timeToWaitBeforeSkippingInMs);
}

module.exports[PlugBotBase.Event.ADVANCE] = handleAdvanceEvent;
