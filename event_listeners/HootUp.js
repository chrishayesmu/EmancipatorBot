/**
 * Lets everyone know when Hoot is in the room and
 * it's time to HOOT THE FUCK UP.
 */

var PlugBotBase = require("plugbotbase");

var LOG = new PlugBotBase.Log("HootUp");

function handleUserJoinEvent(event, globalObject) {
    var bot = globalObject.bot;

    if (event.userID === 3866399) { // hoot's user ID
        LOG.info("MOTHERFUCKING HOOT JOINED THE ROOM AND WE ARE HOOTING UP");

        // This used to be an ASCII owl, but since plug doesn't support consecutive
        // spaces, there's now a bunch of unicode spaces in there, which make it
        // really hard to read
        bot.sendChat("\u2002,\u2002\u2002\u2002\u2002\u2002,\u2002\u2002\u2002 IT IS TIME");
        bot.sendChat("\u2002)\\___/(\u2002\u2002\u2002 TO HOOT");
        bot.sendChat("{(@)v(@)}\u2002 AND PATOOT");
        bot.sendChat("\u2002{|~~~|}\u2002\u2002 THE FUCK");
        bot.sendChat("\u2002{/^^^\\}\u2002\u2002\u2002 UP");
        bot.sendChat("\u2002\`m-m`");
    }
}

module.exports[PlugBotBase.Event.USER_JOIN] = handleUserJoinEvent;
