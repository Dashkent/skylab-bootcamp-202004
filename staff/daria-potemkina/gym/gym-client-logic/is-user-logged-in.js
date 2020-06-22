/**
 * Check if the user token exists
 * 
 * @returns {boolean} true if exists, otherwise false
 */

const context = require('./context')

module.exports = function () {
    const token = this.storage.token;

    return !!token
}.bind(context)