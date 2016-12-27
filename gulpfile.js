/*
    Gulp tasks used for building the angular project 
    in developpement and production mode
    @author Harzli Joumen <harzli.joumen@gmail.com>
*/

const gulp = require("gulp");
const del = require("del");
const runSequence = require('run-sequence').use(gulp);
const recursive = require('recursive-readdir');
const fs = require('fs');
const path = require('path');
const server = require('karma').Server;

/*
    Gulp plugins
*/
const tslint = require('gulp-tslint');
const tsc = require("gulp-typescript");
const sourcemaps = require('gulp-sourcemaps');
const tsProject = tsc.createProject("tsconfig.json");
const plumber = require("gulp-plumber");
const uglify = require('gulp-uglify');
const sysBuilder = require('systemjs-builder');
const liveServer = require('gulp-live-server');
const concat = require('gulp-concat');
const replace = require('gulp-replace');
const showMessage = require('gulp-msg');
const symlink = require('gulp-sym');

/*
    Configuration
*/
const DIST_DIR = 'dist';
const SRC_DIR = 'src';

const APP_DIST_DIR = DIST_DIR + '/app';
const RES_DIST_DIR = APP_DIST_DIR + '/assets';
const TEST_DIST_DIR = DIST_DIR + '/test';

const TEST_SRC_DIR = SRC_DIR + '/test';
const APP_SRC_DIR = SRC_DIR + '/app';
const RES_SRC_DIR = SRC_DIR + '/resources';

/*
    Libraries that bootstrap angular
*/
var libs = [
    'node_modules/core-js/client/shim.min.js',
    'node_modules/zone.js/dist/zone.js',
    'node_modules/reflect-metadata/Reflect.js',
    'node_modules/systemjs/dist/system.src.js',
];

/*
    Gulp tasks
*/





gulp.task("lint", function () {
    return gulp.src('src/**/*.ts')
        .pipe(tslint({
            formatter: "prose"
        }))
        .pipe(tslint.report({
            emitError: false
        }));
});





/*
    [ Clean tasks ]
*/
/*
    Delete dist dir
*/
gulp.task("clean:dist", function (callback) {
    showMessage.Info("Deleting dist dir");
    del.sync(DIST_DIR);
    callback();
}
);

/*
    Delete the assets dir
*/
gulp.task("clean:assets", function (callback) {
    showMessage.Info("Deleting assets dir");
    del(RES_DIST_DIR);
    callback();
});

/*
    Delete the generated files from app dir 
*/
gulp.task("clean:app:js", function (callback) {
    showMessage.Info("Deleting generated files from app dir");
    del.sync([APP_DIST_DIR + '/**/*.js', APP_DIST_DIR + '/**/*.map', '!' + APP_DIST_DIR, '!' + RES_DIST_DIR, '!' + RES_DIST_DIR + '/**.js', '!' + RES_DIST_DIR + '/*.js', '!' + RES_DIST_DIR + '/**/*.js', '!' + RES_DIST_DIR + '/**/*.js']);
    callback();
});

/*
    Delete the generated files in test dir 
*/
gulp.task("clean:test", function (callback) {
    showMessage.Info("Deleting generated files from test dir");
    del(['!' + TEST_DIST_DIR, '!' + TEST_DIST_DIR + '/**', TEST_DIST_DIR + '/**.js', TEST_DIST_DIR + '/**.map']);
    callback();
});

/*
    [ Global tasks ]
    used in both production and developpement mode
*/
/*
    Copy resources from source to assets dir
*/
gulp.task("build:global:copyresources", function (callback) {
    showMessage.Info("Copying resources into assets dir");
    gulp.src([RES_SRC_DIR + '/js/**/*', RES_SRC_DIR + '/img/**/*', RES_SRC_DIR + '/css/**/*', RES_SRC_DIR + '/fonts/**/*'], {
        base: RES_SRC_DIR
    }).pipe(gulp.dest(RES_DIST_DIR));
    callback();
});

/*
    Compile .ts from app src
*/
gulp.task("build:global:compile:app", function (callback) {
    showMessage.Info("Compiling application files");
    gulp.src(APP_SRC_DIR + '/**/*.ts')
        .pipe(plumber({
            errorHandler: function (err) {
                showMessage.error("[APP] [Typescript] failed to compile files: ".err);
                this.emit('end');
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(tsProject()).js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(APP_DIST_DIR));
    callback();
});

/*
    [ Production tasks ]
    used in production mode
*/
/* 
    Prepare the index for the production mode after injecting assets into it
*/
gulp.task("build:prod:index", function (callback) {
    showMessage.Info("Generating index for production mode");
    gulp.src([RES_SRC_DIR + '/html/index.html'])
        .pipe(replace('<!-- build:vendors -->', '<script src="assets/js/vendors.min.js"></script>'))
        .pipe(replace('<!-- build:app -->', '<script src="assets/js/app.min.js"></script>'))
        .pipe(replace('<!-- build:systemjs -->', ''))
        .pipe(gulp.dest(APP_DIST_DIR + '/'));
    callback();
});

/* 
    Bundle libs into vendors.min.js
*/
gulp.task("build:prod:vendors", function (callback) {
    showMessage.Info("Generating vendors bundle");
    gulp.src(libs)
        .pipe(concat('vendors.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(RES_DIST_DIR + '/js/'));
    callback();
});

/* 
    Compiling files after generating vendors bundle
*/
gulp.task("build:prod:compile", function (callback) {
    showMessage.Info("Prearing to create app bundle");
    runSequence("build:prod:vendors", "build:global:compile:app");
    callback();
});

/* 
    Bundle compiled files into app.min.js
*/
gulp.task("build:prod:mainjs", function (callback) {
    showMessage.Info("Generating app bundle");
    /* Load SystemJS configuration */
    showMessage.Info("Loading SystemJS configuration");
    var builder = new sysBuilder('.', 'systemjs.config.js');
    /* Build */
    showMessage.Info("Building bundle");
    builder.buildStatic('app', RES_DIST_DIR + '/js/app.min.js')
        .catch(function (err) {
            showMessage.error('Bundling failed: ', err);
        });
    callback();
});

gulp.task("build:prod", function (callback) {
    runSequence('clean:dist', 'build:global:copyresources', 'build:prod:index', 'build:prod:vendors', 'build:global:compile:app', 'build:prod:mainjs', 'clean:app:js', function (callback) {
        callback();
    });
});

/*
    [ Developpement tasks ]
    used in developpement mode
*/
/*
    copy the libs used by angular
*/
gulp.task("build:dev:copylibs", function () {
    return gulp.src(libs).pipe(gulp.dest(RES_DIST_DIR + '/js'));
});

/* 
    prepare the index for the developpement after injecting libs and resources into the index
*/
gulp.task("build:dev:index", function () {
    return gulp.src([RES_SRC_DIR + '/html/index.html'])
        .pipe(replace('<!-- build:vendors -->', '\
         <script src="assets/js/shim.min.js"></script>\
            <script src="assets/js/zone.js" ></script >\
            <script src="assets/js/Reflect.js"></script>\
            <script src="assets/js/system.src.js"></script>\
        '))
        .pipe(replace('<!-- build:app -->', ''))
        .pipe(replace('<!-- build:systemjs -->', '  <script>\
    System.import("systemjs.config.js").then(function () {    \
        System.import("main");      \
      }).catch(console.error.bind(console));\
  </script>'))
        .pipe(gulp.dest(APP_DIST_DIR + '/'));
});

/*
    edit systemjs and copie it
 */
gulp.task("build:dev:systemjs", function () {
    gulp
    .src('node_modules')
    .pipe(symlink(APP_DIST_DIR+'/node_modules'));
    return gulp.src(['systemjs.config.js'])
        .pipe(replace('dist/app', '.'))
        .pipe(gulp.dest(APP_DIST_DIR + '/'));
});

// fix me
gulp.task('serve', function () {
    var server = liveServer.static(APP_DIST_DIR, 8888);
    server.start();
    gulp.watch(APP_DIST_DIR + '/**/*', server.start.bind(server));
});

function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

gulp.task('test:generatespec', function () {
    recursive('src/app', function (err, files) {
        files.forEach(file => {
            if (file.indexOf('component') > -1 || file.indexOf('service') > -1) {
                var specFile = file.replace('.ts', '.spec.ts').replace('src/app', 'src/test');
                if (!fs.existsSync(specFile)) {
                    var content = "import * as Source from '";
                    var fileArray = file.split('/');
                    for (var i = 0; i < fileArray.length - 1; i++) {
                        content = content + '../';
                    }
                    content = content + file.replace('.ts', '') + "';\n";
                    ensureDirectoryExistence(specFile);
                    fs.writeFileSync(specFile, content);
                }
            }
        });
    });
});

gulp.task("test:compile", function () {
    return gulp.src(TEST_SRC_DIR + '/**/*.ts')
        .pipe(plumber({
            errorHandler: function (err) {
                console.error('>>> [tsc] Typescript compilation failed: '.bold.red, err);
                this.emit('end');
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(tsProject()).js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(TEST_DIST_DIR));
});

gulp.task('test:karma', function (done) {
    new server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});


gulp.task('test:unit', function () {
    return runSequence('clean', 'compile', 'test:compile', 'lint', 'test:karma', function () {
        return console.log('done'.green);
    });
});