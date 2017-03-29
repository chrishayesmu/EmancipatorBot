/**
 * SHUPOON MAGIC
 */

var DubBotBase = require("dubbotbase");

var LOG = new DubBotBase.Log("Shupoon");

function handleUserJoinEvent(event, globalObject) {
    var bot = globalObject.bot;

    if (event.userID === "56018ca04693ff0300c74b97") { // poondonkus's user ID
        LOG.info("It is Shupoon o'clock");

        bot.sendChat(":sparkles: shupoon~ :sparkles:");
    }
}

module.exports[DubBotBase.Event.USER_JOIN] = handleUserJoinEvent;
