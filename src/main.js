var PlugBotBase = require("plugbotbase");
require("es6-promise");

var globalObject = PlugBotBase.start(__dirname + "/..");

exports.bot = globalObject.bot;
exports.globalObject = globalObject;
