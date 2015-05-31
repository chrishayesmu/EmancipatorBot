function handler(event, globalObject) {
    var bot = globalObject.bot;
    var woots = globalObject.roomState.playHistory[0].votes.woots;

    if (woots.length === 0) {
        bot.sendChat("There are no woots on the current song.");
    }
    else {
        var usernames = woots.map(function(userID) {
            var user = globalObject.roomState.findUserInRoomById(userID);
            return (user && user.username) || null;
        }).filter(function(username) {
            return !!username;
        });

        bot.sendChat("This song is wooted by {} people: {}", usernames.length, usernames.join(", "));
    }
}

module.exports = {
    handler: handler,
    triggers: [ "woots" ]
}
