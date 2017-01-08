'use strict';

/**
 * compile ts, sass and less files
 *
 * @author Harzli Joumen <harzli.joumen@gmail.com>
 */

const gulp = require('gulp'),
    tsc = require('gulp-typescript'),
    sourcemaps = require('gulp-sourcemaps'),
    less = require('gulp-less'),
    sass = require('gulp-sass'),
    utils = require('./utils'),
    errorHandler = require('./errorHandler'),
    autoprefixer = require('gulp-autoprefixer'),
    config = require('../../project-config');

/**
 * true if gulp is watching
 * false if gulp is building the project
 */
let watchMode = false;

/**
 * function that compiles typescript files
 */
function compileTsFiles(filesSrc, filesDest, configFile, done) {
    const tsProject = tsc.createProject(configFile);
    gulp.src(filesSrc)
        .pipe(sourcemaps.init())
        .pipe(tsProject()).js
        .on('error', watchMode ? errorHandler.warning : errorHandler.fatal)
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(filesDest))
        .on('end', function() {
            done();
        });
};

/**
 * Compile files for SystemJS
 */
function compileAppTsFiles(done) {
    compileTsFiles(config.paths.sources.app + '**/*.ts', config.paths.destinations.app, 'tsconfig.json', done);
}

/**
 * Compile files for RollupJS
 */
function compileTsFilesRollup(done) {
    compileTsFiles(config.paths.sources.app + '**/*.ts', config.paths.destinations.app, 'tsconfig-exp.json', done);
}

/**
 * Compile .ts for RollupJS
 */
gulp.task('compile:app:rollup', ['clean:appjs'], function(done) {
    compileTsFilesRollup(done);
});

/**
 * Compile .ts for SystemJS
 */
gulp.task('compile:app', ['clean:appjs'], function(done) {
    compileAppTsFiles(done);
});

/**
 * watch and compile application files
 */
gulp.task('compile:app:watch', ['compile:app'], function() {
    watchMode = true;
    gulp.watch(config.paths.sources.app + '**/*.ts', ['compile:app']);
});


/**
 * Compile .ts from test src and die if failed used when building the project
 */
gulp.task('compile:test', ['compile:app', 'clean:test'], function(done) {
    compileTsFiles(config.paths.sources.test + '**/*.ts', config.paths.destinations.test, 'tsconfig.json', done);
});

/**
 * Compile .ts from test src and continue if failed used when developping the project
 */
gulp.task('compile:test:watch', ['compile:test'], function(done) {
    watchMode = true;
    gulp.watch([config.paths.sources.test + '**/*.ts', config.paths.sources.app + '**/*.ts'], ['compile:test']);
});


/**
 * Copy fonts files to assets
 */
gulp.task('compile:copyfonts', ['clean:stylesheet'], function(done) {
    utils.copy(config.paths.sources.resources.fonts + '**/*', config.paths.destinations.resources.fonts, done);
});

/**
 * Copy css files to assets
 */
gulp.task('compile:copycss', ['clean:stylesheet'], function(done) {
    utils.copy(config.paths.sources.resources.css + '**/*.css', config.paths.destinations.resources.css, done);
});

/**
 * Copy css files to assets
 */
gulp.task('compile:copyimg', ['clean:stylesheet'], function(done) {
    utils.copy(config.paths.sources.resources.img + '**/*', config.paths.destinations.resources.img, done);
});

/**
 * Copy css files to assets
 */
gulp.task('compile:copyjs', ['clean:stylesheet'], function(done) {
    utils.copy(config.paths.sources.resources.js + '**/*.js', config.paths.destinations.resources.js, done);
});

/**
 * Compile less and sass files
 * partials are included automatically
 * by the compilator
 */
function compileToCSS(compiler, extension, done) {
    gulp.src(
        [
            config.paths.sources.resources.css + '**/*.' + extension,
            '!' + config.paths.sources.resources.css + '**/_*.' + extension,
        ])
        .pipe(sourcemaps.init())
        .pipe(compiler())
        .on('error', watchMode ? errorHandler.warning : errorHandler.fatal)
        .pipe(autoprefixer({browsers: config.browsersList}))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(config.paths.destinations.resources.css))
        .on('end', function() {
            done();
        });
}

/**
 * function that compile less files
 */
function compileLESS(done) {
    compileToCSS(less, 'less', done);
}

/**
 * function that compile sass files
 */
function compileSASS(done) {
    compileToCSS(sass, 'scss', done);
}

/*
    Generate css files from less
*/
gulp.task('compile:less', ['clean:stylesheet'], function(done) {
    compileLESS(done);
});

/*
   Generate css files from sass
 */
gulp.task('compile:sass', ['clean:stylesheet'], function(done) {
    compileSASS(done);
});

/*
    watch and compile less files
*/
gulp.task('compile:less:watch', ['compile:less', 'lint:less'], function() {
    watchMode = true;
    gulp.watch(config.paths.sources.resources.css + '**/*.less', ['compile:less', 'lint:less']);
});

/*
    watch and compile sass files
*/
gulp.task('compile:sass:watch', ['compile:sass', 'lint:sass'], function() {
    watchMode = true;
    gulp.watch(config.paths.sources.resources.css + '**/*.scss', ['compile:sass', 'lint:sass']);
});
