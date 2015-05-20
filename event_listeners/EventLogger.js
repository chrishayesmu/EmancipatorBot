/**
 * Simple event listener which just logs certain events. Does not
 * record them in a database or anything like that.
 *
 * TODO expand which events are logged
 */
"use strict";

var PlugBotBase = require("plugbotbase");
var ChatType = PlugBotBase.ChatType;
var Event = PlugBotBase.Event;

var LOG = new PlugBotBase.Log("EventLogger");

function chatHandler(event, /* unused */ global) {
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
    var user = globalObject.roomState.findUserInRoomById(event.userID);

    if (!user) {
        LOG.warn("Received grab event for userID = {}, but couldn't find them in the room", event.userID);
        return;
    }

    LOG.info("{} grabbed the current song", user.username);
}

function voteHandler(event, globalObject) {
    var voteType = event.vote === 1 ? "wooted" : "mehhed";
    var user = globalObject.roomState.findUserInRoomById(event.userID);

    if (!user) {
        LOG.warn("Received vote event (vote = {}) for userID = {}, but couldn't find them in the room", event.vote, event.userID);
        return;
    }

    LOG.info("{} {} the current song", user.username, voteType);
}

module.exports[Event.CHAT] = { handler: chatHandler };
module.exports[Event.VOTE] = { handler: voteHandler };
