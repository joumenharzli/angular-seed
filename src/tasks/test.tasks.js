'use strict';

/**
 * Test tasks
 *
 * @author Harzli Joumen <harzli.joumen@gmail.com>
 */

const gulp = require('gulp'),
    recursive = require('recursive-readdir'),
    fs = require('fs'),
    path = require('path'),
    server = require('karma').Server,
    config = require('../../project-config');

/**
 * Create directory if it doesn't exists
 */
function ensureDirectoryExistence(filePath) {
    let dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

/**
 * launch karma in watch and single mode
 */
function launchKarma(single, done) {
    let parentDir = __dirname.substr(0, __dirname.length - config.paths.sources.tasks.length);
    new server({
        configFile: parentDir + '/karma.conf.js',
        singleRun: single,
    }, done).start();
}

/*
    Generate Specs
*/
gulp.task('test:generatespec', function() {
    recursive(config.paths.sources.app, function(err, files) {
        files.forEach((file) => {
            if (
                file.indexOf('component') > -1 ||
                file.indexOf('service') > -1
            ) {
                const specFile = file.replace('.ts', '.spec.ts').replace(config.paths.sources.app, config.paths.sources.test);
                if (!fs.existsSync(specFile)) {
                    let content = 'import * as Source from \'';
                    const fileArray = file.split('/');
                    for (let i = 0; i < fileArray.length - 1; i++) {
                        content = content + '../';
                    }
                    content = content + file.replace('.ts', '') + '\';\n';
                    ensureDirectoryExistence(specFile);
                    fs.writeFileSync(specFile, content);
                }
            }
        });
    });
});


/**
 * Execute Karma
 */
gulp.task('test:unit', ['compile:app', 'compile:test'], function(done) {
    launchKarma(true, done);
});

/**
 * Execute Karma and watch file changes
 */
gulp.task('test:unit:watch', ['compile:app', 'compile:test'], function(done) {
    launchKarma(false, done);
});
