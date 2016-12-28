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
const sysBuilder = require('systemjs-builder');

/*
    Gulp plugins
*/
const tslint = require('gulp-tslint');
const tsc = require("gulp-typescript");
const sourcemaps = require('gulp-sourcemaps');
const plumber = require("gulp-plumber");
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const replace = require('gulp-replace');
const showMessage = require('gulp-msg');
const symlink = require('gulp-sym');

/*
    Configuration
*/
const BUILD_DIR = 'dist';
const SRC_DIR = 'src';
const SRV_PORT = 8888;

const APP_BUILD_DIR = BUILD_DIR + '/app';
const TEST_BUILD_DIR = BUILD_DIR + '/test';
const ASSETS_BUILD_DIR = APP_BUILD_DIR + '/assets';
const JS_ASSETS_BUILD_DIR = ASSETS_BUILD_DIR + '/js';
const IMG_ASSETS_BUILD_DIR = ASSETS_BUILD_DIR + '/img';
const HTML_ASSETS_BUILD_DIR = ASSETS_BUILD_DIR + '/html';
const FONTS_ASSETS_BUILD_DIR = ASSETS_BUILD_DIR + '/fonts';
const CSS_ASSETS_BUILD_DIR = ASSETS_BUILD_DIR + '/css';

const APP_SRC_DIR = SRC_DIR + '/app';
const TEST_SRC_DIR = SRC_DIR + '/test';
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

/*
    [ Clean tasks ]
*/
/*
    Delete dist dir
*/
gulp.task("clean:dist", function (callback) {
    showMessage.Info("Deleting dist dir");
    del.sync(BUILD_DIR);
    callback();
}
);

/*
    Delete app dir
*/
gulp.task("clean:app", function (callback) {
    showMessage.Info("Deleting app dir");
    del.sync(APP_BUILD_DIR);
    callback();
}
);

/*
    Delete the assets dir
*/
gulp.task("clean:assets", function (callback) {
    showMessage.Info("Deleting assets dir");
    del.sync(ASSETS_BUILD_DIR);
    callback();
});

/*
    Delete the generated files from app dir 
*/
gulp.task("clean:appjs", function (callback) {
    showMessage.Info("Deleting generated files from app dir");
    del.sync([
        APP_BUILD_DIR + '/**',
        '!' + APP_BUILD_DIR,
        '!' + ASSETS_BUILD_DIR,
        '!' + ASSETS_BUILD_DIR + '/**',
        '!' + APP_BUILD_DIR + '/node_modules',
        '!' + APP_BUILD_DIR + '/node_modules/**',
        '!' + APP_BUILD_DIR + '/index.html',
        '!' + APP_BUILD_DIR + '/systemjs.config.js'
    ]);
    callback();
});

/*
    Delete the generated files in test dir 
*/
gulp.task("clean:test", function (callback) {
    showMessage.Info("Deleting generated files from test dir");
    del.sync([TEST_BUILD_DIR]);
    callback();
});

/*
    Cleaning app bundle
*/
gulp.task("clean:bundles:app", function (callback) {
    showMessage.Info("Deleting app bundle");
    del.sync([JS_ASSETS_BUILD_DIR + '/app.min.js']);
    callback();
});

/*
    Cleaning vendors bundle
*/
gulp.task("clean:bundles:vendors", function (callback) {
    showMessage.Info("Deleting vendors bundles");
    del.sync([JS_ASSETS_BUILD_DIR + '/vendors.min.js']);
    callback();
});

/*
    Cleaning index and systemjs
*/
gulp.task("clean:index", function (callback) {
    showMessage.Info("Deleting index and SystemJS configuration");
    del.sync([APP_BUILD_DIR + '/index.html', APP_BUILD_DIR + '/systemjs.config.js']);
    callback();
});

/*
    [ Global tasks ]
    used in both production and developpement mode
*/
/*
    Linting
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
    Copy resources from source to assets dir
*/
gulp.task("build:global:copyresources", ["clean:assets"], function (callback) {
    showMessage.Info("Copying resources into assets dir");
    gulp.src([
        RES_SRC_DIR + '/js/**/*',
        RES_SRC_DIR + '/img/**/*',
        RES_SRC_DIR + '/css/**/*',
        RES_SRC_DIR + '/fonts/**/*'
    ], { base: RES_SRC_DIR }).pipe(gulp.dest(ASSETS_BUILD_DIR));
    callback();
});

/*
    function that compiles typescript files
    dieIfFailed used to stop gulp execution it's used 
    when building the bundle 
 */
function compileFiles(dieIfFailed, filesSrc, callback) {
    var error;
    const tsProject = tsc.createProject("tsconfig.json");
    gulp.src(filesSrc)
        .pipe(plumber({
            errorHandler: function (err) {
                this.emit('end');
                error = err;
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(tsProject()).js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(APP_BUILD_DIR)).on('end', function () {
            if (!error) {
                showMessage.Success('[Typescript] Compilation succeeded');
            } else {
                showMessage.Error("[Typescript] Compilation failed");
                if (dieIfFailed) {
                    process.exit();
                }
            }
            callback();
        });
};

/*
    Compile .ts from app src and die if failed used when building the project
*/
gulp.task("build:global:compile:app", ["clean:appjs"], function (callback) {
    showMessage.Info("Compiling application files");
    compileFiles(true, APP_SRC_DIR + '/**/*.ts', callback);
});

/*
    Compile .ts from app src and continue if failed used when developping the project
*/
gulp.task("build:global:compile:app:nostop", ["clean:appjs"], function (callback) {
    showMessage.Info("Compiling application files");
    compileFiles(false, APP_SRC_DIR + '/**/*.ts', callback);
});

/*
    watch and compile application files
*/
gulp.task("build:global:compile:app:watch", ["build:global:compile:app:nostop"], function () {
    gulp.watch(APP_SRC_DIR + '/**/*.ts', ["build:global:compile:app:nostop"]);
});

/*
    [ Testing tasks ]
    used for tests
*/
/*
    Create directory if it doesn't exists
*/
function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

/*
    Generate Specs
*/
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

/*
    Compile .ts from test src and die if failed used when building the project
*/
gulp.task("test:compile", ["clean:test"], function (callback) {
    showMessage.Info("Compiling test files");
    compileFiles(true, TEST_SRC_DIR + '/**/*.ts', callback);
});

/*
    Compile .ts from test src and continue if failed used when developping the project
*/
gulp.task("test:compile:nostop", ["clean:test"], function (callback) {
    showMessage.Info("Compiling test files");
    compileFiles(false, TEST_SRC_DIR + '/**/*.ts', callback);
});

/*
    watch and compile test files
*/
gulp.task("test:compile:watch", ["test:compile:nostop"], function () {
    gulp.watch(TEST_SRC_DIR + '/**/*.ts', ["test:compile:nostop"]);
});

/* 
    Execute Karma
*/
gulp.task('test:karma:once', ["build:global:compile:app", "test:compile"], function (done) {
    new server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

/* 
    Execute Karma and watch file changes
*/
gulp.task('test:karma', ["build:global:compile:app", "test:compile"], function (done) {
    new server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: false
    }, done).start();
});

/*
    [ Production tasks ]
    used in production mode
*/
/* 
    Bundle libs into vendors.min.js
*/
gulp.task("build:prod:vendors", ["clean:bundles:vendors"], function (callback) {
    showMessage.Info("Generating vendors bundle");
    gulp.src(libs)
        .pipe(concat('vendors.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(JS_ASSETS_BUILD_DIR + '/'))
        .on('end', function () {
            showMessage.Success("Bundling vendors succeeded");
            callback();
        });
});

/* 
    Bundle compiled files into app.min.js
*/
gulp.task("build:prod:mainjs", ["build:global:compile:app", "clean:bundles:app"], function (callback) {
    showMessage.Info("Generating app bundle");
    /* Load SystemJS configuration */
    showMessage.Info("Loading SystemJS configuration");
    var builder = new sysBuilder('.', 'systemjs.config.js');
    /* Build */
    showMessage.Info("Building bundle");
    builder.buildStatic('app', JS_ASSETS_BUILD_DIR + '/app.min.js', {
        minify: true
    })
        .then(function () {
            showMessage.Success("Bundling application succeeded");
            callback();
        })
        .catch(function (err) {
            showMessage.Error('Bundling application failed: ' + err);
            process.exit();
        });
});

/* 
    Prepare the index for the production mode after injecting assets into it
*/
gulp.task("build:prod:index", ["build:prod:mainjs", "build:prod:vendors", "clean:index"], function (callback) {
    showMessage.Info("Generating index for production mode");
    gulp.src([RES_SRC_DIR + '/html/index.html'])
        .pipe(replace('<!-- build:vendors -->', '<script src="assets/js/vendors.min.js"></script>'))
        .pipe(replace('<!-- build:app -->', '<script src="assets/js/app.min.js"></script>'))
        .pipe(replace('<!-- build:systemjs -->', ''))
        .pipe(gulp.dest(APP_BUILD_DIR + '/'))
        .on('end', function () {
            showMessage.Success("Index generated");
            callback();
        });
});


/* 
    Generating application for production
*/
gulp.task("build:prod", function (callback) {
    runSequence("clean:app", 'build:global:copyresources', 'build:prod:index', 'clean:appjs', callback);
});

/*
    [ Developpement tasks ]
    used in developpement mode
*/
/*
    copy the libs used by angular
*/
gulp.task("build:dev:copylibs", function (callback) {
    gulp.src(libs).pipe(gulp.dest(ASSETS_BUILD_DIR + '/js')).on("end", function () {
        showMessage.Success("Libs copied");
        callback();
    });
});

/*
    edit systemjs and copy it
 */
gulp.task("build:dev:systemjs", ["clean:index"], function (callback) {
    gulp.src(['systemjs.config.js'])
        .pipe(replace('dist/app', '.'))
        .pipe(gulp.dest(APP_BUILD_DIR + '/'))
        .on("end", function () {
            showMessage.Success("systemjs created and configured");
            callback();
        });
});

/* 
    prepare the index for the developpement adding libs and systemjs into the index
*/
gulp.task("build:dev:index", ["build:dev:copylibs", "build:dev:systemjs", "build:global:compile:app"], function (callback) {
    gulp.src([RES_SRC_DIR + '/html/index.html'])
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
        .pipe(gulp.dest(APP_BUILD_DIR + '/'))
        .on("end", function () {
            showMessage.Success("Index generated");
            callback();
        });
});


/* 
    Generating application for developpement
*/
gulp.task("build:dev", function (callback) {
    runSequence("clean:app", 'build:global:copyresources', 'build:dev:index', callback);
});

/*
    [ Server tasks ]
*/

/* 
    Reloading the server
*/
gulp.task("reloadserver", function (callback) {
    browserSync.reload();
    callback();
});

/*
    Compile Application and reload Server
*/
gulp.task("compileandreload", function (callback) {
    runSequence("build:global:compile:app", "reloadserver", callback);
});

/*
   Copy resources and reload server 
*/
gulp.task("copyresandreload", function (callback) {
    runSequence("build:global:copyresources", "reloadserver", callback);
});

/*
    Run gulp live server and reload server when changes
*/
gulp.task('serve', ["build:dev"], function () {
    browserSync.init({
        port: SRV_PORT,
        server: {
            baseDir: APP_BUILD_DIR + '/',
            index: 'index.html',
            routes: {
                "/assets": ASSETS_BUILD_DIR,
                "/node_modules": 'node_modules'
            }
        }
    });
    gulp.watch(APP_SRC_DIR + '/**/*.ts', ["compileandreload"]);
    gulp.watch(RES_SRC_DIR + '/**/*', ["copyresandreload"]);
});

/*
    Run gulp live server and reload server when changes
*/
gulp.task('serve:simple', function () {
    browserSync.init({
        port: SRV_PORT,
        server: {
            baseDir: APP_BUILD_DIR + '/'
        }
    });
});