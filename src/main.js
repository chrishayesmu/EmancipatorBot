var PlugBotBase = require("plugbotbase");
require("./promise").polyfill();

var globalObject = PlugBotBase.start(__dirname + "/..");

exports.bot = globalObject.bot;
exports.globalObject = globalObject;
