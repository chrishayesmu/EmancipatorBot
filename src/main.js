var PlugBotBase = require("PlugBotBase");
require("es6-promise");

var plugBot = PlugBotBase.start(__dirname + "/..");

exports.bot = plugBot;
