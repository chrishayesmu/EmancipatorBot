/**
 * Tracks how many mehs have been placed against the current song.
 * If it meets a configuration-defined threshold, the bot will print
 * a message to the room and may (depending on configuration) force
 * skip the song.
 */

var DubBotBase = require("dubbotbase");

var LOG = new DubBotBase.Log("AutoSkipMehhedSongs");

var alreadyWarnedOnCurrentSong = false;

function handleAdvanceEvent() {
    alreadyWarnedOnCurrentSong = false;
}

function handleVoteEvent(event, globalObject) {
    if (alreadyWarnedOnCurrentSong) {
        return;
    }

    var percentageToSkipAt = globalObject.config.Emancipator.AutoSkipMehhedSongs.percentageToSkipAt;
    var preventSingleMehFromSkipping = globalObject.config.Emancipator.AutoSkipMehhedSongs.preventSingleMehFromSkipping;

    var currentPlay = globalObject.roomState.playHistory[0];
    var numberOfMehs = currentPlay.votes.mehs.length;
    var numberOfListeners = globalObject.roomState.usersInRoom.length - 1; // don't count the bot
    var percentageOfRoomMehhing = 100 * (numberOfMehs / numberOfListeners);

    if (percentageOfRoomMehhing > percentageToSkipAt && (!preventSingleMehFromSkipping || numberOfMehs > 1)) {
        LOG.info("Current song exceeded meh skip threshold of {}%", percentageToSkipAt);
        globalObject.bot.sendChat("The current song has exceeded the meh skip threshold of {}%.", percentageToSkipAt);
        alreadyWarnedOnCurrentSong = true;
        skipIfAllowed(globalObject);
    }
    else if (numberOfMehs > 0) {
        LOG.info("This song isn't ready to skip (meh % is at {} and there are {} mehs)", percentageOfRoomMehhing, numberOfMehs);
    }
}

function init(globalObject) {
    var percentageToSkipAt = globalObject.config.Emancipator.AutoSkipMehhedSongs.percentageToSkipAt;

    if (percentageToSkipAt < 1 || percentageToSkipAt > 100) {
        throw new Error("Configuration error: Emancipator.AutoSkipMehhedSongs.percentageToSkipAt not in range 1-100; actual value is " + percentageToSkipAt);
    }
}

/**
 * Skips the current DJ if configuration allows for it.
 *
 * @param {object} globalObject - The global object from the event
 */
function skipIfAllowed(globalObject) {
    if (globalObject.config.Emancipator.AutoSkipMehhedSongs.forceSkipMehhedSongs) {
        LOG.info("Attempting to force skip DJ");
        globalObject.bot.forceSkip(function(succeeded) {
            if (succeeded) {
                LOG.info("Successfully skipped a duplicate song.");
            }
            else {
                LOG.warn("Failed to skip duplicate song. The bot may not have sufficient permissions in the room.");
            }
        });
    }
    else {
        LOG.info("Not configured to force skip on duplicate plays. Doing nothing.");
    }
}

module.exports[DubBotBase.Event.ADVANCE] = handleAdvanceEvent;
module.exports[DubBotBase.Event.VOTE] = handleVoteEvent;
module.exports.init = init;
