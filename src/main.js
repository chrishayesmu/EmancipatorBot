var DubBotBase = require("dubbotbase");
require("./polyfills").polyfill();

var botServer = require("./http/server");

var globalObject = DubBotBase.start(__dirname + "/..");

botServer.start(globalObject);

exports.bot = globalObject.bot;
exports.globalObject = globalObject;
