/**
 * Contains a simple polyfill to add some useful
 * functionality for Promises.
 */

function polyfill() {
    require("es6-promise").polyfill();

    /**
     * Wraps a value in a Promise which will be immediately
     * fulfilled when called on.
     *
     * @param {mixed} value - Any value
     * @returns {Promise} A Promise which will fulfill immediately
     */
    if (!Promise.prototype.wrap) {
        Promise.wrap = function(value) {
            return new Promise(function(resolve, reject) {
                resolve(value);
            });
        };
    }

    /**
     * Wraps an error in a Promise which will immediately
     * cause an error when called on.
     *
     * @param {mixed} error - Any value
     * @returns {Promise} A Promise which will error immediately
     */
    if (!Promise.prototype.wrapError) {
        Promise.wrapError = function(error) {
            return new Promise(function(resolve, reject) {
                reject(error);
            });
        };
    }

    // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
    if (!Array.prototype.find) {
        Array.prototype.find = function(predicate) {
            if (this == null) {
                throw new TypeError('Array.prototype.find called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return value;
                }
            }
            return undefined;
        };
    }
}

exports.polyfill = polyfill;
