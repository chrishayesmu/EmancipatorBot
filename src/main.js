var PlugBotBase = require("PlugBotBase");
require("es6-promise");

var globalObject = PlugBotBase.start(__dirname + "/..");

exports.bot = globalObject.bot;
exports.globalObject = globalObject;
