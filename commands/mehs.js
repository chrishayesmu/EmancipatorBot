function handler(event, globalObject) {
    var bot = globalObject.bot;
    var mehs = globalObject.roomState.playHistory[0].votes.mehs;

    if (mehs.length === 0) {
        bot.sendChat("There are no mehs on the current song.");
    }
    else {
        var usernames = mehs.map(function(userID) {
            var user = globalObject.roomState.findUserInRoomById(userID);
            return (user && user.username) || null;
        }).filter(function(username) {
            return !!username;
        });

        bot.sendChat("This song is mehhed by {} people: {}", usernames.length, usernames.join(", "));
    }
}

module.exports = {
    handler: handler,
    triggers: [ "mehs" ]
}
