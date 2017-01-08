'use strict';

/**
 * Errors handlers
 *
 * @author Harzli Joumen <harzli.joumen@gmail.com>
 */

const gutil = require('gulp-util');

/**
 * handle error and kill process
 * used when building
 */
function fatal(title, callback) {
    errorHandler(title, true, callback);
}

/**
 * handle error and continue
 * used when gulp is watching
 */
function warning(title, callback) {
    errorHandler(title, false, callback);
}

/**
 * handle error function
 */
function errorHandler(title, isFatal, callback) {
    return function(err) {
        gutil.log(gutil.colors.red('[' + title + '] Error'), err.message);
        if (isFatal) {
            process.exit(1);
        }
        callback(err);
    };
}

exports.fatal = fatal;
exports.warning = warning;
