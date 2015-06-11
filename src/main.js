var PlugBotBase = require("plugbotbase");
require("./polyfills").polyfill();

var botServer = require("./http/server");

var globalObject = PlugBotBase.start(__dirname + "/..");

botServer.start(globalObject);

exports.bot = globalObject.bot;
exports.globalObject = globalObject;
