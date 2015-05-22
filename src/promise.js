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
    Promise.wrap = function(value) {
        return new Promise(function(resolve, reject) {
            resolve(value);
        });
    };

    /**
     * Wraps an error in a Promise which will immediately
     * cause an error when called on.
     *
     * @param {mixed} error - Any value
     * @returns {Promise} A Promise which will error immediately
     */
    Promise.wrapError = function(error) {
        return new Promise(function(resolve, reject) {
            reject(error);
        });
    };
}

exports.polyfill = polyfill;
