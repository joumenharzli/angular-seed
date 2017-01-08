'use strict';

/**
 * Server tasks
 *
 * @author Harzli Joumen <harzli.joumen@gmail.com>
 */

const gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    runSequence = require('run-sequence').use(gulp),
    config = require('../../project-config');

/**
 * function that launches browserSync
 */
function launchServer() {
    browserSync.init({
        port: config.project.srvPort,
        server: {
            baseDir: config.paths.destinations.app,
            index: 'index.html',
            routes: {
                '/assets': config.paths.destinations.resources.resbase,
                '/node_modules': 'node_modules',
            },
        },
    });
}

/**
 * Reload the server
 */
gulp.task('server:reload', function(done) {
    browserSync.reload();
    done();
});

/**
 * Compile Application files and reload Server
 */
gulp.task('server:compileandreload', function(done) {
    runSequence('compile:app:watch', 'server:reload', done);
});

/**
 * Copy resources and reload server
 */
gulp.task('server:copyresandreload', function(done) {
    runSequence('build:assets', 'build:cssbundle', 'server:reload', done);
});


/**
 * Run browserSync server and reload server when changes
 */
gulp.task('serve:dev', ['build:dev'], function() {
    launchServer();
    gulp.watch(config.paths.sources.app + '**/*.ts', ['server:compileandreload']);
    gulp.watch(config.paths.sources.resources.resbase + '**/*', ['server:copyresandreload']);
});

/**
 * Run browserSync server
 */
gulp.task('serve', function(done) {
    launchServer();
    done();
});
