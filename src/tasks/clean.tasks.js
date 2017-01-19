'use strict';

/**
 * Deleting files and directories
 *
 * @author Harzli Joumen <harzli.joumen@gmail.com>
 */

const gulp = require('gulp'),
    utils = require('./utils'),
    del = require('del'),
    config = require('../../project-config');

/**
 * Alias for deleting dist directory
 */
gulp.task('clean', ['clean:dist'], function (done) {
    done();
});

/**
 * Delete dist directory
 */
gulp.task('clean:dist', function (done) {
    utils.deleteSync(config.paths.destinations.destbase, done);
});

/**
 * Delete app dir
 */
gulp.task('clean:app', function (done) {
    utils.deleteSync(config.paths.destinations.app, done);
});

/**
 * Delete the js assets dir
 */
gulp.task('clean:assetsjs', function (done) {
    utils.deleteSync(config.paths.destinations.resources.js, done);
});

/**
 * Delete the img assets dir
 */
gulp.task('clean:assetsimg', function (done) {
    utils.deleteSync(config.paths.destinations.resources.img, done);
});

/**
 * Clean css and fonts in assets dir
 */
gulp.task('clean:stylesheet', function (done) {
    utils.deleteSync([config.paths.destinations.resources.fonts, config.paths.destinations.resources.css], done);
});

/**
 * Delete the generated files from app dir
 */
gulp.task('clean:appjs', function (done) {
    del.sync([
        config.paths.destinations.app + '**',
        '!' + utils.removeSlash(config.paths.destinations.app),
        '!' + utils.removeSlash(config.paths.destinations.resources.resbase),
        '!' + config.paths.destinations.resources.resbase + '**',
        '!' + config.paths.destinations.app + 'index.html',
        '!' + config.paths.destinations.app + 'systemjs.config.js',
    ]);
    done();
});

/**
 * Delete the generated files in test dir
 */
gulp.task('clean:test', function (done) {
    utils.deleteSync(config.paths.destinations.test, done);
});

/**
 * Clean aot
 */
gulp.task('clean:aot', function (done) {
    utils.deleteSync(config.paths.destinations.aotbase, done);
});

/**
 * Delete the generated files in e2e dir
 */
gulp.task('clean:e2e', function (done) {
    utils.deleteSync(config.paths.destinations.e2e, done);
});

/**
 * delete app bundle
 */
gulp.task('clean:bundles:app', function (done) {
    utils.deleteSync(config.paths.destinations.resources.js + 'app.min.js', done);
});

/**
 * delete vendors bundle
 */
gulp.task('clean:bundles:vendors', function (done) {
    utils.deleteSync(config.paths.destinations.resources.js + 'vendors.min.js', done);
});

/**
 * delete index and systemjs
 */
gulp.task('clean:index', function (done) {
    utils.deleteSync([
        config.paths.destinations.app + 'index.html',
        config.paths.destinations.app + 'systemjs.config.js',
    ], done);
});
