'use strict';

/**
 * functions and used in different tasks
 *
 * @author Harzli Joumen <harzli.joumen@gmail.com>
 */

const gulp = require('gulp'),
    del = require('del'),
    errorHandler = require('./errorHandler');

/**
 * Copy files and folders
 */
function copy(source, destination, done) {
    gulp.src(source)
        .pipe(gulp.dest(destination))
        .on('error', errorHandler.fatal)
        .on('end', function() {
            done();
        });
}

/**
 * Del don't recognize 'directory/' as a directory
 * '/' should be removed before deleting
 */
function removeSlash(target) {
    if (target.lastIndexOf('/') === (target.length - 1)) {
        target = target.substring(0, target.length - 1);
    }
    return target;
}

/**
 *  function that delete files and directories
 */
function deleteSync(target, done) {
    removeSlash(target);
    del.sync(target);
    done();
}

exports.deleteSync = deleteSync;
exports.removeSlash = removeSlash;
exports.copy = copy;
