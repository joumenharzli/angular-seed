'use strict';

/**
 * compile ts, sass and less files
 *
 * @author Harzli Joumen <harzli.joumen@gmail.com>
 */

const gulp = require('gulp'),
    gutil = require('gulp-util'),
    csso = require('gulp-csso'),
    tsc = require('gulp-typescript'),
    sourcemaps = require('gulp-sourcemaps'),
    less = require('gulp-less'),
    sass = require('gulp-sass'),
    through = require('through2'),
    fs = require('fs'),
    path = require('path'),
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
        .pipe(through.obj(function (file, enc, cb) {
            integrateCSS(file, enc, cb);
        }))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(filesDest))
        .on('end', function () {
            done();
        });
};

/**
 * include css contents in app js files
 */
function integrateCSS(file, enc, cb) {
    /* Check if the file is a component */
    if (file.path.indexOf('component.js') > -1) {
        /* read file content */
        let data = file.contents.toString('utf8');

        /* Define search pattern */
        let patt = new RegExp(/styleUrls.*?:.*?\[(.*?)\]/i);
        let res = patt.exec(data);

        /* if styleUrls exists in the file */
        if (res != null) {
            /* intialise the new content */
            let elementsData = 'styles:[';

            /* return an array of the included files */
            let elements = res[1].replace(/'/g, '').replace(/"/g, '').replace(/scss/g, 'css').replace(/less/g, 'css').split(',');

            elements.forEach((styleFileName) => {
                /* read css contents */
                let styleFilePath = path.resolve(path.dirname(file.path), styleFileName);
                console.log(styleFilePath);
                let styleFileData = fs.readFileSync(styleFilePath, 'utf8').toString();
                elementsData = elementsData.concat('\'', styleFileData, '\',');
            });

            /* set the new content to the file */
            elementsData = elementsData.concat(']');
            file.contents = new Buffer(data.replace(res[0], elementsData), 'utf8');
        }
    }
    cb(null, file)
}

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
gulp.task('compile:app:rollup', ['build:assets:included', 'clean:appjs'], function (done) {
    compileTsFilesRollup(done);
});

/**
 * Compile .ts for SystemJS
 */
gulp.task('compile:app', ['build:assets:included', 'clean:appjs'], function (done) {
    compileAppTsFiles(done);
});

/**
 * watch and compile application files
 */
gulp.task('compile:app:watch', ['compile:app'], function () {
    watchMode = true;
    gulp.watch(config.paths.sources.app + '**/*.ts', ['compile:app']);
});


/**
 * Compile .ts from test src and die if failed used when building the project
 */
gulp.task('compile:test', ['compile:app', 'clean:test'], function (done) {
    compileTsFiles(config.paths.sources.test + '**/*.ts', config.paths.destinations.test, 'tsconfig.json', done);
});

/**
 * Compile .ts from test src and continue if failed used when developping the project
 */
gulp.task('compile:test:watch', ['compile:test'], function (done) {
    watchMode = true;
    gulp.watch([config.paths.sources.test + '**/*.ts', config.paths.sources.app + '**/*.ts'], ['compile:test']);
});


/**
 * Copy fonts files to assets
 */
gulp.task('compile:copyfonts', ['clean:stylesheet'], function (done) {
    utils.copy(config.paths.sources.resources.fonts + '**/*', config.paths.destinations.resources.fonts, done);
});

/**
 * Copy css files to assets
 */
gulp.task('compile:copycss', ['clean:stylesheet'], function (done) {
    utils.copy(config.paths.sources.resources.css + '**/*.css', config.paths.destinations.resources.css, done);
});

/**
 * Copy css files to assets
 */
gulp.task('compile:copyimg', ['clean:stylesheet'], function (done) {
    utils.copy(config.paths.sources.resources.img + '**/*', config.paths.destinations.resources.img, done);
});

/**
 * Copy css files to assets
 */
gulp.task('compile:copyjs', ['clean:stylesheet'], function (done) {
    utils.copy(config.paths.sources.resources.js + '**/*.js', config.paths.destinations.resources.js, done);
});

/**
 * Compile less and sass files
 * partials are included automatically
 * by the compilator
 * minify is true when including generated 
 * css into js files
 */
function compileStylestoCSS(compiler, source, destination, extension, minify, done) {
    gulp.src(source)
        .pipe(sourcemaps.init())
        .pipe(compiler())
        .on('error', watchMode ? errorHandler.warning : errorHandler.fatal)
        .pipe(autoprefixer({ browsers: config.browsersList }))
        .pipe(minify ? csso() : gutil.noop())
        .pipe(minify ? gutil.noop() : sourcemaps.write('./maps'))
        .pipe(gulp.dest(destination))
        .on('end', function () {
            done();
        });
}

/**
 * Compile Styles from App
 */
function compileStylesToCSSFromApp(compiler, extension, done) {
    compileStylestoCSS(compiler,
        [config.paths.sources.app + '**/*.' + extension,
        '!' + config.paths.sources.app + '**/_*.' + extension],
        config.paths.destinations.app,
        extension,
        true,
        done);
}

/**
 * Compile Styles From Res
 */
function compileStylesToCSSFromRes(compiler, extension, done) {
    compileStylestoCSS(compiler,
        [config.paths.sources.resources.css + '**/*.' + extension,
        '!' + config.paths.sources.resources.css + '**/_*.' + extension],
        config.paths.destinations.resources.css,
        extension,
        false,
        done);
}

/**
 * function that compile less files
 */
function compileLESS(fromRes, done) {
    fromRes ? compileStylesToCSSFromRes(less, 'less', done) : compileStylesToCSSFromApp(less, 'less', done);
}

/**
 * function that compile sass files
 */
function compileSASS(fromRes, done) {
    fromRes ? compileStylesToCSSFromRes(sass, 'scss', done) : compileStylesToCSSFromApp(sass, 'scss', done);
}

/**
 * Generate css files from less
 */
gulp.task('compile:less', ['clean:stylesheet'], function (done) {
    compileLESS(true, done);
});

/**
 * Generate css files from sass
 */
gulp.task('compile:sass', ['clean:stylesheet'], function (done) {
    compileSASS(true, done);
});

/**
 * Generate css files from included less in app
 */
gulp.task('compile:less:included', ['clean:appjs'], function (done) {
    compileLESS(false, done);
});

/**
 * Generate css files from included sass in app
 */
gulp.task('compile:sass:included', ['clean:appjs'], function (done) {
    compileSASS(false, done);
});

/**
 * Copy included css files in app
 */
gulp.task('compile:copycss:included', ['clean:appjs'], function (done) {
    utils.copy(config.paths.sources.app + '**/*.css', config.paths.destinations.app, done);
});

/*
    watch and compile less files
*/
gulp.task('compile:less:watch', ['compile:less', 'lint:less'], function () {
    watchMode = true;
    gulp.watch(config.paths.sources.resources.css + '**/*.less', ['compile:less', 'lint:less']);
});

/*
    watch and compile sass files
*/
gulp.task('compile:sass:watch', ['compile:sass', 'lint:sass'], function () {
    watchMode = true;
    gulp.watch(config.paths.sources.resources.css + '**/*.scss', ['compile:sass', 'lint:sass']);
});
