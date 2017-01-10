'use strict';

/**
 * lint ts, sass and less files
 *
 * @author Harzli Joumen <harzli.joumen@gmail.com>
 */

const gulp = require('gulp'),
    tslint = require('gulp-tslint'),
    scsslint = require('gulp-sass-lint'),
    lesslint = require('gulp-lesshint'),
    csslint = require('gulp-csslint'),
    config = require('../../project-config');

/**
 * lint ts files
 */
function lintTS(sources) {
    return gulp.src(sources + '**/*.ts')
        .pipe(tslint({
            formatter: 'prose',
        }))
        .pipe(tslint.report({
            emitError: false,
        }));
}

/**
 * lint less files
 */
function lintLESS(sources) {
    return gulp.src(sources + '**/*.less')
        .pipe(lesslint())
        .pipe(lesslint.reporter());
}

/**
 * lint sass files
 */
function lintSASS(sources) {
    return gulp.src(sources + '**/*.scss')
        .pipe(scsslint())
        .pipe(scsslint.format());
}

/**
 * lint css files
 */
function lintCSS(sources) {
    return gulp.src(sources + '**/*.css')
        .pipe(csslint())
        .pipe(csslint.formatter())
}


/**
 * lint app ts files
 */
gulp.task('lint:app', function () {
    return lintTS(config.paths.sources.app);
});

/**
 * lint test ts files
 */
gulp.task('lint:test', function () {
    return lintTS(config.paths.sources.test);
});

/**
 * lint sass files
 */
gulp.task('lint:sass', ['compile:sass'], function () {
    return lintSASS(config.paths.sources.resources.css);
});

/**
 * lint included sass files in app
 */
gulp.task('lint:sass:included', ['compile:sass:included'], function () {
    return lintSASS(config.paths.sources.app);
});

/**
 * lint less files
 */
gulp.task('lint:less', ['compile:less'], function () {
    return lintLESS(config.paths.sources.resources.css);
});


/**
 * lint included less files in app
 */
gulp.task('lint:less:included', ['compile:less:included'], function () {
    return lintLESS(config.paths.sources.app);
});

/**
 * lint css files in source res directory
 */
gulp.task('lint:css', ['compile:copycss'], function () {
    return lintCSS(config.paths.sources.resources.css);
});

/**
 * lint css files in source res directory
 */
gulp.task('lint:css:included', ['compile:copycss:included'], function () {
    return lintCSS(config.paths.sources.app);
});