"use strict";

/**
 * Detects when a song has been played more than once in a configurable
 * time interval and says so in the chat. Can be configured to skip the
 * song and/or restore the skipped DJ to the top of the wait list.
 */

var PlugBotBase = require("plugbotbase");

var LOG = new PlugBotBase.Log("DuplicatePlayDetection");

function handleAdvanceEvent(event, globalObject) {
    var requiredMinutesBetweenPlays = globalObject.config.Emancipator.DuplicatePlayDetection.minTimeBetweenPlaysInMinutes;
    var minElapsedTimeInMs = 1000 * 60 * requiredMinutesBetweenPlays;
    var now = Date.now();

    var playsOfSameVideo = globalObject.roomState.findPlaysForContentId(event.media.contentID);

    for (var i = 0; i < playsOfSameVideo.length; i++) {
        var play = playsOfSameVideo[i];
        var timeSincePlay = now - play.startDate;

        // Make sure timeSincePlay > 0; otherwise we're actually looking at the currently playing song
        if (timeSincePlay > 0 && timeSincePlay <= minElapsedTimeInMs) {
            globalObject.bot.sendChat("This song was played less than {} minutes ago by {}.", requiredMinutesBetweenPlays, play.user.username);
            skipIfAllowed(globalObject, event.incomingDJ.userID);
            return;
        }
    }
}

/**
 * Skips the current DJ if configuration allows for it.
 *
 * @param {object} globalObject - The global object from the event
 * @param {integer} userID - The user ID of the DJ who's about to be skipped
 */
function skipIfAllowed(globalObject, userID) {
    if (globalObject.config.Emancipator.DuplicatePlayDetection.forceSkipRepeatedSongs) {
        LOG.info("Attempting to force skip DJ");
        globalObject.bot.forceSkip(function(succeeded) {
            if (succeeded) {
                LOG.info("Successfully skipped a duplicate song.");
                moveDjToTopIfAllowed(globalObject, userID);
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

/**
 * Moves the skipped DJ back to the top of the wait list if configuration allows for it.
 *
 * @param {object} globalObject - The global object from the event
 * @param {integer} userID - The user ID of the DJ who was skipped
 */
function moveDjToTopIfAllowed(globalObject, userID) {
    if (globalObject.config.Emancipator.DuplicatePlayDetection.moveSkippedDjsToTopOfWaitList) {
        LOG.info("Attempting to restore DJ (userID = {}) to the top of the wait list.", userID);
        globalObject.bot.moveDjInWaitList(userID, 1);
    }
    else {
        LOG.info("Not configured to restore DJ position after skipping. Doing nothing.");
    }
}

module.exports[PlugBotBase.Event.ADVANCE] = handleAdvanceEvent;
