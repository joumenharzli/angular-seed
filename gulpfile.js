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
const less = require('gulp-less');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');

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
const libs = [
    'node_modules/core-js/client/shim.min.js',
    'node_modules/zone.js/dist/zone.js',
    'node_modules/reflect-metadata/Reflect.js',
    'node_modules/systemjs/dist/system.src.js',
];

/* 
    Supported browsers used by autoprefixer
*/
const BROWSER_LIST = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

/*
    Gulp tasks
*/

/*
    [ Clean tasks ]
*/

/**
 *  function that delete files and folder
 */
function deleteAll(target, done) {
    showMessage.Warning('Deleting ' + target);
    del.sync(target);
    showMessage.Success(target + ' deleted');
    done();
}
/*
    Delete dist dir
*/
gulp.task("clean:dist", function (done) {
    deleteAll(BUILD_DIR, done);
});

/*
    Delete app dir
*/
gulp.task("clean:app", function (done) {
    deleteAll(APP_BUILD_DIR, done);
});

/*
    Delete the js assets dir
*/
gulp.task("clean:assetsjs", function (done) {
    deleteAll(JS_ASSETS_BUILD_DIR, done);
});

/*
    Delete the img assets dir
*/
gulp.task("clean:assetsimg", function (done) {
    deleteAll(IMG_ASSETS_BUILD_DIR, done);
});

/* 
    Clean css and fonts in assets dir
*/
gulp.task("clean:stylesheet", function (done) {
    deleteAll([FONTS_ASSETS_BUILD_DIR, CSS_ASSETS_BUILD_DIR], done);
});

/*
    Delete the generated files from app dir 
*/
gulp.task("clean:appjs", function (done) {
    showMessage.Warning("Deleting generated js and map files from app dir");
    del.sync([
        APP_BUILD_DIR + '/**',
        '!' + APP_BUILD_DIR,
        '!' + ASSETS_BUILD_DIR,
        '!' + ASSETS_BUILD_DIR + '/**',
        //'!' + APP_BUILD_DIR + '/node_modules',
        //'!' + APP_BUILD_DIR + '/node_modules/**',
        '!' + APP_BUILD_DIR + '/index.html',
        '!' + APP_BUILD_DIR + '/systemjs.config.js'
    ]);
    showMessage.Success("Deleted generated js and map files from app dir");
    done();
});

/*
    Delete the generated files in test dir 
*/
gulp.task("clean:test", function (done) {
    deleteAll(TEST_BUILD_DIR, done);
});

/*
    Cleaning app bundle
*/
gulp.task("clean:bundles:app", function (done) {
    deleteAll(JS_ASSETS_BUILD_DIR + '/app.min.js', done);
});

/*
    Cleaning vendors bundle
*/
gulp.task("clean:bundles:vendors", function (done) {
    deleteAll(JS_ASSETS_BUILD_DIR + '/vendors.min.js', done);
});

/*
    Cleaning index and systemjs
*/
gulp.task("clean:index", function (done) {
    deleteAll([APP_BUILD_DIR + '/index.html', APP_BUILD_DIR + '/systemjs.config.js'], done);
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
    Copy image and js resources from source to assets dir
*/
gulp.task("build:global:copyresources", ['stylesheet:less', 'stylesheet:sass', 'stylesheet:css', 'stylesheet:fonts', "clean:assetsjs", "clean:assetsimg"], function (done) {
    showMessage.Warning("Copying resources into assets dir");
    gulp.src([
        RES_SRC_DIR + '/js/**/*',
        RES_SRC_DIR + '/img/**/*',
    ], { base: RES_SRC_DIR }).pipe(gulp.dest(ASSETS_BUILD_DIR));
    done();
});

/*
    function that compiles typescript files
    dieIfFailed used to stop gulp execution it's used 
    when building the bundle 
 */
function compileFiles(dieIfFailed, filesSrc, done) {
    let error;
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
                showMessage.Error("[Typescript] Compilation failed " + error);
                if (dieIfFailed) {
                    process.exit();
                }
            }
            done();
        });
};

/*
    Compile .ts from app src and die if failed used when building the project
*/
gulp.task("build:global:compile:app", ["clean:appjs"], function (done) {
    showMessage.Warning("Compiling application files");
    compileFiles(true, APP_SRC_DIR + '/**/*.ts', done);
});

/*
    Compile .ts from app src and continue if failed used when developping the project
*/
gulp.task("build:global:compile:app:nostop", ["clean:appjs"], function (done) {
    showMessage.Warning("Compiling application files");
    compileFiles(false, APP_SRC_DIR + '/**/*.ts', done);
});

/*
    watch and compile application files
*/
gulp.task("build:global:compile:app:watch", ["build:global:compile:app:nostop"], function () {
    gulp.watch(APP_SRC_DIR + '/**/*.ts', ["build:global:compile:app:nostop"]);
});

/*
    function to change the environment mode
*/
function setEnvironment(prod) {
    let mode;
    const tsProject = tsc.createProject("tsconfig.json");
    mode = (prod) ? 'prod' : 'dev';
    return gulp.src([APP_BUILD_DIR + '/environment.js'])
        .pipe(replace('%REPLACEME%', mode))
        .pipe(gulp.dest(APP_BUILD_DIR))
        .on('end', function () {
            showMessage.Success("Environment configured");
        });
}

/*
    [ Testing tasks ]
    used for tests
*/
/*
    Create directory if it doesn't exists
*/
function ensureDirectoryExistence(filePath) {
    let dirname = path.dirname(filePath);
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
                const specFile = file.replace('.ts', '.spec.ts').replace('src/app', 'src/test');
                if (!fs.existsSync(specFile)) {
                    let content = "import * as Source from '";
                    const fileArray = file.split('/');
                    for (let i = 0; i < fileArray.length - 1; i++) {
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
gulp.task("test:compile", ["clean:test"], function (done) {
    showMessage.Warning("Compiling test files");
    compileFiles(true, TEST_SRC_DIR + '/**/*.ts', done);
});

/*
    Compile .ts from test src and continue if failed used when developping the project
*/
gulp.task("test:compile:nostop", ["clean:test"], function (done) {
    showMessage.Warning("Compiling test files");
    compileFiles(false, TEST_SRC_DIR + '/**/*.ts', done);
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

/* Configure the environment */
gulp.task("build:configure:prod", ['build:global:compile:app'], function (done) {
    showMessage.Success('Configuruing environment');
    setEnvironment(true);
    done();
});

/* 
    Bundle libs into vendors.min.js
*/
gulp.task("build:prod:vendors", ["clean:bundles:vendors"], function (done) {
    showMessage.Warning("Generating vendors bundle");
    gulp.src(libs)
        .pipe(concat('vendors.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(JS_ASSETS_BUILD_DIR + '/'))
        .on('end', function () {
            showMessage.Success("Bundling vendors succeeded");
            done();
        });
});

/* 
    Bundle compiled files into app.min.js
*/
gulp.task("build:prod:mainjs", ["build:configure:prod", "clean:bundles:app"], function (done) {
    showMessage.Warning("Generating app bundle");
    /* Load SystemJS configuration */
    showMessage.Warning("Loading SystemJS configuration");
    const builder = new sysBuilder('.', 'systemjs.config.js');
    /* Build */
    showMessage.Warning("Building bundle");
    builder.buildStatic('app', JS_ASSETS_BUILD_DIR + '/app.min.js', {
        minify: true
    })
        .then(function () {
            showMessage.Success("Bundling application succeeded");
            done();
        })
        .catch(function (err) {
            showMessage.Error('Bundling application failed: ' + err);
            process.exit();
        });
});

/* 
    Prepare the index for the production mode after injecting assets into it
*/
gulp.task("build:prod:index", ["build:prod:mainjs", "build:prod:vendors", "clean:index"], function (done) {
    showMessage.Warning("Generating index for production mode");
    gulp.src([RES_SRC_DIR + '/html/index.html'])
        .pipe(replace('<!-- build:vendors -->', '<script src="assets/js/vendors.min.js"></script>'))
        .pipe(replace('<!-- build:app -->', '<script src="assets/js/app.min.js"></script>'))
        .pipe(replace('<!-- build:systemjs -->', ''))
        .pipe(gulp.dest(APP_BUILD_DIR + '/'))
        .on('end', function () {
            showMessage.Success("Index generated");
            done();
        });
});


/* 
    Generating application for production
*/
gulp.task("build:prod", function (done) {
    runSequence("clean:app", 'build:global:copyresources', 'build:prod:index', 'clean:appjs', 'stylesheet:bundle', done);
});

/*
    [ Developpement tasks ]
    used in developpement mode
*/
/*
    Configure the environment
*/
gulp.task("build:configure:dev", function (done) {
    showMessage.Success('Configuruing environment');
    setEnvironment(false);
    done();
});

/*
    copy the libs used by angular
*/
gulp.task("build:dev:copylibs", function (done) {
    gulp.src(libs).pipe(gulp.dest(ASSETS_BUILD_DIR + '/js')).on("end", function () {
        showMessage.Success("Libs copied");
        done();
    });
});

/*
    edit systemjs and copy it
 */
gulp.task("build:dev:systemjs", ["clean:index"], function (done) {
    gulp.src(['systemjs.config.js'])
        .pipe(replace('dist/app', '.'))
        .pipe(gulp.dest(APP_BUILD_DIR + '/'))
        .on("end", function () {
            showMessage.Success("systemjs created and configured");
            done();
        });
});

/* 
    prepare the index for the developpement adding libs and systemjs into the index
*/
gulp.task("build:dev:index", ["build:dev:copylibs", "build:dev:systemjs", "build:global:compile:app"], function (done) {
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
            done();
        });
});


/* 
    Generating application for developpement
*/
gulp.task("build:dev", function (done) {
    runSequence("clean:app", 'build:global:copyresources', 'build:dev:index', 'build:configure:dev', done);
});

/*
    [ Server tasks ]
*/

/* 
    Reloading the server
*/
gulp.task("reloadserver", function (done) {
    browserSync.reload();
    done();
});

/*
    Compile Application and reload Server
*/
gulp.task("compileandreload", function (done) {
    runSequence("build:global:compile:app:nostop", "reloadserver", done);
});

/*
   Copy resources and reload server 
*/
gulp.task("copyresandreload", function (done) {
    runSequence("build:global:copyresources", "reloadserver", done);
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

/*
    [ Stylesheet tasks ]
*/

/* 
    Copy css files to assets
*/
gulp.task('stylesheet:css', ['clean:stylesheet'], function (done) {
    gulp.src(RES_SRC_DIR + '/css/**/*.css')
        .pipe(gulp.dest(ASSETS_BUILD_DIR + '/css/'))
        .on('end', function () {
            showMessage.Success("CSS files copied");
            done();
        });
});

/* 
    Copy fonts files to assets
*/
gulp.task('stylesheet:fonts', ['clean:stylesheet'], function (done) {
    gulp.src(RES_SRC_DIR + '/fonts/**/*')
        .pipe(gulp.dest(ASSETS_BUILD_DIR + '/fonts/'))
        .on('end', function () {
            showMessage.Success("fonts files copied");
            done();
        });
});

/*
    function that compile less and sass files
*/
function compileCSS(compiler, name, type, done) {
    showMessage.Warning('Compiling ' + name + ' files');
    gulp.src(
        [
            RES_SRC_DIR + '/css/**/*.' + type,
            '!' + RES_SRC_DIR + '/css/**/_*.' + type
        ])
        .pipe(sourcemaps.init())
        .pipe(compiler())
        .on('error', function (err) {
            showMessage.Error('[' + name + '-compiler] error : ' + err.message);
            done(err);
        })
        .pipe(autoprefixer({ browsers: BROWSER_LIST }))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(CSS_ASSETS_BUILD_DIR))
        .on('end', function () {
            showMessage.Success(name + ' compiled to css');
            done();
        });
}

/*
    function that compile less files
*/
function compileLESS(done) {
    compileCSS(less, 'less', 'less', done);
}

/*
    function that compile sass files
*/
function compileSASS(done) {
    compileCSS(sass, 'sass', 'scss', done);
}

/*
    Generate css files from less
*/
gulp.task('stylesheet:less', ['clean:stylesheet'], function (done) {
    compileLESS(done);
});

/*
   Generate css files from sass
 */
gulp.task('stylesheet:sass', ['clean:stylesheet'], function (done) {
    compileSASS(done);
});

/*
    watch and compile less files
*/
gulp.task("stylesheet:less:watch", ["stylesheet:less"], function () {
    gulp.watch(RES_SRC_DIR + '/css/**/*.less', ["stylesheet:less"]);
});

/*
    watch and compile sass files
*/
gulp.task("stylesheet:sass:watch", ["stylesheet:sass"], function () {
    gulp.watch(RES_SRC_DIR + '/css/**/*.scss', ["stylesheet:sass"]);
});

/**
 *  Bundle css
 */
gulp.task('stylesheet:bundle', function (done) {
    showMessage.Warning('Generating CSS Bundle');
    gulp.src(CSS_ASSETS_BUILD_DIR + '/**/*.css')
        .pipe(concat('bundle.css'))
        .on('error', function (err) {
            showMessage.Error('[ CSS-bundle ] concat error : ' + err.message);
            done(err);
        })
        .pipe(autoprefixer({ browsers: BROWSER_LIST }))
        .on('error', function (err) {
            showMessage.Error('[ CSS-bundle ] autoprefixer error : ' + err.message);
            done(err);
        })
        .pipe(csso())
        .on('error', function (err) {
            showMessage.Error('[ CSS-bundle ] csso error : ' + err.message);
            done(err);
        })
        .pipe(gulp.dest(CSS_ASSETS_BUILD_DIR))
        .on('end', function () {
            showMessage.Success('Css files bundled to bundle.css');
            del.sync([CSS_ASSETS_BUILD_DIR + '/**', '!' + CSS_ASSETS_BUILD_DIR, '!' + CSS_ASSETS_BUILD_DIR + '/bundle.css']);
            done();
        });
});

/**
 * Inject into browser
 */
gulp.task('stylesheet:inject', function (done) {

});