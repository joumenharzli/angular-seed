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
 * lint app ts files
 */
gulp.task('lint:app', function () {
    return gulp.src(config.paths.sources.app + '**/*.ts')
        .pipe(tslint({
            formatter: 'prose',
        }))
        .pipe(tslint.report({
            emitError: false,
        }));
});

/**
 * lint app ts files
 */
gulp.task('lint:test', function () {
    return gulp.src(config.paths.sources.test + '**/*.ts')
        .pipe(tslint({
            formatter: 'prose',
        }))
        .pipe(tslint.report({
            emitError: false,
        }));
});

/**
 * lint sass files
 */
gulp.task('lint:sass', function () {
    return gulp.src(config.paths.sources.resources.css + '**/*.scss')
        .pipe(scsslint())
        .pipe(scsslint.format());
});

/**
 * lint less files
 */
gulp.task('lint:less', function () {
    return gulp.src(config.paths.sources.resources.css + '**/*.less')
        .pipe(lesslint())
        .pipe(lesslint.reporter());
});

/**
 * lint included sass files in app
 */
gulp.task('lint:sass:included', ['compile:sass:included'], function () {
    return gulp.src(config.paths.sources.app + '**/*.scss')
        .pipe(scsslint())
        .pipe(scsslint.format());
});

/**
 * lint included less files in app
 */
gulp.task('lint:less:included', ['compile:less:included'], function () {
    return gulp.src(config.paths.sources.app + '**/*.less')
        .pipe(lesslint())
        .pipe(lesslint.reporter());
});

/**
 * lint css files
 */
function lintCSS(sources, done) {
    return gulp.src(sources)
        .pipe(csslint())
        .pipe(csslint.formatter())
}

/**
 * lint css files in source res directory
 */
gulp.task('lint:css', ['compile:copycss'], function () {
    return lintCSS(config.paths.sources.resources.css + '**/*.css');
});

/**
 * lint css files in source res directory
 */
gulp.task('lint:css:included', ['compile:copycss:included'], function () {
    return lintCSS(config.paths.sources.app + '**/*.css');
});