/**
 * Simple event listener which just logs certain events. Does not
 * record them in a database or anything like that.
 *
 * TODO expand which events are logged
 */
"use strict";

var DubBotBase = require("dubbotbase");
var ChatType = DubBotBase.ChatType;
var Event = DubBotBase.Event;

var LOG = new DubBotBase.Log("EventLogger");

function advanceHandler(event, globalObject) {
    LOG.info("The DJ has changed to {} playing \"{}\".", event.incomingDJ.username, event.media.fullTitle);
}

function chatHandler(event, /* unused */ globalObject) {
    var chatDescriptor;
    switch (event.type) {
        case ChatType.MESSAGE:
            chatDescriptor = "said";
            break;
        case ChatType.EMOTE:
            chatDescriptor = "emote";
            break;
        case ChatType.COMMAND:
            chatDescriptor = "sent command";
            break;
    }

    LOG.info("{} {} >>> {}", event.username, chatDescriptor, event.message);
}

function grabHandler(event, globalObject) {
    LOG.info("{} grabbed the current song", event.user.username);
}

function voteHandler(event, globalObject) {
    var voteType = event.vote === 1 ? "updubbed" : "downdubbed";

    LOG.info("{} {} the current song", event.user.username, voteType);
}

module.exports[Event.ADVANCE] = { handler: advanceHandler };
module.exports[Event.CHAT] = { handler: chatHandler };
module.exports[Event.GRAB] = { handler: grabHandler };
module.exports[Event.VOTE] = { handler: voteHandler };
