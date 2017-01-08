'use strict';

/**
 * Build project
 *
 * @author Harzli Joumen <harzli.joumen@gmail.com>
 */

const gulp = require('gulp'),
    sysBuilder = require('systemjs-builder'),
    gutil = require('gulp-util'),
    runSequence = require('run-sequence').use(gulp),
    inject = require('gulp-inject'),
    uglify = require('gulp-uglify'),
    replace = require('gulp-replace'),
    autoprefixer = require('gulp-autoprefixer'),
    htmlmin = require('gulp-htmlmin'),
    csso = require('gulp-csso'),
    concat = require('gulp-concat'),
    rollup = require('rollup'),
    rollupNodeResolve = require('rollup-plugin-node-resolve'),
    rollupCommonjs = require('rollup-plugin-commonjs'),
    rollupUglify = require('rollup-plugin-uglify'),
    utils = require('./utils'),
    del = require('del'),
    errorHandler = require('./errorHandler'),
    config = require('../../project-config');

/**
 * Build methods
 */
const buildMethods = {
    systemjs: 0,
    rollup: 1,
    aot: 2,
};
let buildMethod = buildMethods.systemjs;

/**
 * Build modes
 */
const buildModes = {
    dev: 'dev',
    prod: 'prod',
};
let buildMode = buildModes.dev;

/**
 * function that changes the environment mode
 * by replacing %REPLACEME% with the appropriate mode
 */
function configEnvironment() {
    return gulp.src([config.paths.destinations.app + '/environment.js'])
        .pipe(replace('%REPLACEME%', buildMode))
        .pipe(gulp.dest(config.paths.destinations.app));
}

/**
 * Build ressources files and copy them into assets directory
 */
gulp.task('build:assets',
    ['compile:less', 'compile:sass',
        'compile:copyfonts', 'compile:copycss', 'compile:copyimg', 'compile:copyjs'],
    function(done) {
        done();
    }
);

/**
 * Prepare index
 */
gulp.task('build:index', ['clean:index'], function(done) {
    let vendorsbundle = '';
    let systemjs = '';
    let appbundle = '';
    if (buildMode === buildModes.prod) {
        vendorsbundle = '<script src="assets/js/vendors.min.js"></script>';
        appbundle = '<script src="assets/js/app.min.js"></script>';
        systemjs = '';
    } else {
        let libs = config.libs.concat(config.systemjsLibs);
        libs.forEach(function(lib) {
            vendorsbundle = vendorsbundle + '<script src="' + lib + '"></script>';
        });
        appbundle = '';
        systemjs = '<script>\
                    System.import("systemjs.config.js").then(function () {    \
                    System.import("main");      \
                    }).catch(console.error.bind(console));\
                    </script>';
    }

    gulp.src([config.paths.sources.resources.html + 'index.html'])
        .pipe(replace('<!-- build:vendors -->', vendorsbundle))
        .pipe(replace('<!-- build:app -->', appbundle))
        .pipe(replace('<!-- build:systemjs -->', systemjs))
        .pipe(gulp.dest(config.paths.destinations.app))
        .on('end', function() {
            done();
        });
});

/**
 * Index minification
 */
gulp.task('build:index:minify', function() {
    return gulp.src(config.paths.destinations.app + 'index.html')
        .pipe(htmlmin({
            collapseWhitespace: true,
            minifyJS: true,
            removeComments: true,
            /* Used to impove gzip compression */
            sortAttributes: true,
            sortClassName: true,
        }))
        .pipe(gulp.dest(config.paths.destinations.app));
});

/**
 * Bundle css files and minify
 */
gulp.task('build:cssbundle', function(done) {
    gulp.src(config.paths.destinations.resources.css + '**/*.css')
        .pipe(concat('bundle.min.css'))
        .on('error', errorHandler.fatal)
        .pipe(autoprefixer({browsers: config.browsersList}))
        .on('error', errorHandler.fatal)
        .pipe(csso())
        .on('error', errorHandler.fatal)
        .pipe(gulp.dest(config.paths.destinations.resources.css))
        .on('end', function() {
            del.sync([
                config.paths.destinations.resources.css + '**',
                '!' + utils.removeSlash(config.paths.destinations.resources.css),
                '!' + config.paths.destinations.resources.css + 'bundle.min.css']);
            done();
        });
});

/* Configure the environment */
gulp.task('build:patchenvironment', function(done) {
    configEnvironment();
    done();
});

/**
 * Bundle libs into vendors.min.js
 */
gulp.task('build:vendorsbundle', function(done) {
    let libs = config.libs;
    if (buildMethod === buildMethods.rollup) {
        libs = libs.concat(config.extLibs);
    }
    gulp.src(libs)
        .pipe(concat('vendors.min.js'))
        .on('error', errorHandler.fatal)
        .pipe(uglify())
        .on('error', errorHandler.fatal)
        .pipe(gulp.dest(config.paths.destinations.resources.js))
        .on('end', function() {
            done();
        });
});

/*
    function to inject files into index
*/
function injectIntoIndex(src, ext, done) {
    const target = gulp.src(config.paths.destinations.app + 'index.html');
    const sources = gulp.src(src, {read: false});
    target.pipe(inject(sources, {relative: true, starttag: '<!-- inject:' + ext + ' -->'}))
        .on('error', errorHandler.fatal)
        .pipe(gulp.dest(config.paths.destinations.app))
        .on('end', function() {
            done();
        });
}

/**
 * injecting css files
 */
gulp.task('build:inject:css', function(done) {
    injectIntoIndex([
        config.paths.destinations.resources.css + '**/*.css',
    ], 'css', done);
});

/**
 * injecting js files
 */
gulp.task('build:inject:js', function(done) {
    injectIntoIndex([
        config.paths.destinations.resources.js + '**/*.js',
        '!' + config.paths.destinations.resources.js + 'app.min.js',
        '!' + config.paths.destinations.resources.js + 'vendors.min.js',
    ], 'js', done);
});

/**
 * Inject css & js files into browser
 */
gulp.task('build:injectassets', function(done) {
    runSequence('build:inject:css', 'build:inject:js', done);
});

/**
 * Prepare to build for production
 */
gulp.task('build:preprod', function(done) {
    buildMode = buildModes.prod;
    if (gutil.env.rollup) {
        buildMethod = buildMethods.rollup;
    } else if (gutil.env.aot) {
        buildMethod = buildMethods.aot;
    } else {
        buildMethod = buildMethods.systemjs;
    }
    runSequence('clean:app', 'build:assets', 'build:index',
        'build:cssbundle', 'build:injectassets', 'build:vendorsbundle',
        'build:index:minify', done);
});

/**
 * Compile and bundle files into app.min.js with system js builder
 */
gulp.task('build:appbundle', ['compile:app'], function(done) {
    configEnvironment();
    const builder = new sysBuilder('.', 'systemjs.config.js');
    builder.buildStatic('app', config.paths.destinations.resources.js + 'app.min.js', {minify: true})
        .then(function() {
            done();
        })
        .catch(errorHandler.fatal);
});

/**
 * Compile and bundle files into app.min.js with rollup
 */
gulp.task('build:appbundle:rollup', ['compile:app:rollup'], function(done) {
    configEnvironment();
    return rollup.rollup({
        entry: config.paths.destinations.app + 'main.js',
        external: ['lodash'],
        globals: {
            lodash: '_',
        },
        plugins: [
            rollupNodeResolve({jsnext: true, module: true}),
            rollupCommonjs({
                include: 'node_modules/rxjs/**',
            }),
            rollupUglify(),
        ],
    }).then(function(bundle) {
        bundle.write({
            dest: config.paths.destinations.resources.js + 'app.min.js',
            sourceMap: false,
            format: 'iife',
            globals: {
                lodash: '_',
            },
        });
    });
});

/**
 * Build in production with SystemJs
 */
gulp.task('build:prod', ['build:preprod'], function(done) {
    if (buildMethod === buildMethods.rollup) {
        runSequence('build:appbundle:rollup', 'clean:appjs', function() {
            done();
        });
    } else if (buildMethod === buildMethods.aot) {
        done(); // Not supported yet
    } else {
        runSequence('build:appbundle', 'clean:appjs', function() {
            done();
        });
    }
});

/**
 * edit systemjs and copy it
 */
gulp.task('build:copysystemjs', function(done) {
    gulp.src(['systemjs.config.js'])
        .pipe(replace('dist/app', '.'))
        .pipe(gulp.dest(config.paths.destinations.app))
        .on('end', function() {
            done();
        });
});


/**
 * build for developpement mode
 */
gulp.task('build:dev', function(done) {
    buildMode = buildModes.dev;
    runSequence('clean:app', 'build:assets', 'build:index',
        'build:injectassets',
        'compile:app', 'build:patchenvironment', 'build:copysystemjs', done);
});
