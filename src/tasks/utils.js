'use strict';

/**
 * functions and used in different tasks
 *
 * @author Harzli Joumen <harzli.joumen@gmail.com>
 */

const gulp = require('gulp'),
    del = require('del'),
    errorHandler = require('./errorHandler'),
    path = require('path'),
    exec = require('child_process').exec,
    config = require('../../project-config');

/**
 * Copy files and folders
 */
function copy(source, destination, done) {
    gulp.src(source)
        .pipe(gulp.dest(destination))
        .on('error', errorHandler.fatal)
        .on('end', function () {
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

/**
 * Execute commande
 */
function executeShell(cmd, done) {
    exec(cmd, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        if (err) {
            process.exit(1);
        }
        done(err);
    });
}

/**
 * return node_modules/.bin/app 
 */
function getAppinBinDir(app) {
    let parentDir = __dirname.substr(0, __dirname.length - config.paths.sources.tasks.length);
    return path.join(parentDir, 'node_modules', '.bin', app);
}

exports.deleteSync = deleteSync;
exports.removeSlash = removeSlash;
exports.copy = copy;
exports.executeShell = executeShell;
exports.getAppinBinDir = getAppinBinDir;
