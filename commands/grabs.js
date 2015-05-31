function handler(event, globalObject) {
    var bot = globalObject.bot;
    var grabs = globalObject.roomState.playHistory[0].votes.grabs;

    if (grabs.length === 0) {
        bot.sendChat("There are no grabs on the current song.");
    }
    else {
        var usernames = grabs.map(function(userID) {
            var user = globalObject.roomState.findUserInRoomById(userID);
            return (user && user.username) || null;
        }).filter(function(username) {
            return !!username;
        });

        bot.sendChat("This song is grabbed by {} people: {}", usernames.length, usernames.join(", "));
    }
}

module.exports = {
    handler: handler,
    triggers: [ "grabs" ]
}
