'use strict';

/**
 * Gulp tasks used for cleaning, compiling, linting
 * and building the angular project in developpement
 * and production mode
 *
 * @author Harzli Joumen <harzli.joumen@gmail.com>
 */


const gulp = require('gulp'),
    dir = require('require-dir'),
    config = require('./project-config');

/**
 * Load all tasks
 */
const tasks = dir(config.paths.sources.tasks);

/**
 * default task
 */
gulp.task('default', ['buid:dev'], function(done) {
    done();
});
