'use strict';

/**
 * Project configuration 
 * 
 * @author Harzli Joumen <harzli.joumen@gmail.com>
 */

/**
 * Global configuration
 */
const project = {
    srvPort: 8888,
    srvCoveragePort: 7777
};

/**
 * Project structure
 * only paths is exported
 * basePaths is used for simplifing
 * the refactoring
 */
const basePaths = {
    src: 'src/',
    resources: 'src/resources/',
    dest: 'dist/',
    assets: 'dist/app/assets/'
}

const paths = {
    sources: {
        srcbase: basePaths.src,
        app: basePaths.src + 'app/',
        resources: {
            resbase: basePaths.resources,
            js: basePaths.resources + 'js/',
            img: basePaths.resources + 'img/',
            html: basePaths.resources + 'html/',
            fonts: basePaths.resources + 'fonts/',
            css: basePaths.resources + 'css/',
        },
        tasks: basePaths.src + 'tasks/',
        test: basePaths.src + 'test/',
        e2e: basePaths.src + 'e2e/',
    },
    destinations: {
        destbase: basePaths.dest,
        app: basePaths.dest + 'app/',
        resources: {
            resbase: basePaths.assets,
            js: basePaths.assets + 'js/',
            img: basePaths.assets + 'img/',
            fonts: basePaths.assets + 'fonts/',
            css: basePaths.assets + 'css/',
        },
        test: basePaths.dest + 'test/',
        coverage: basePaths.dest + 'test/coverage',
        e2e: basePaths.dest + 'e2e/',
        aot: basePaths.dest + 'aot/src/app',
    }
};

/**
 * Libraries used by angular
 */
const libs = [
    'node_modules/core-js/client/shim.min.js',
    'node_modules/zone.js/dist/zone.js',
];

/**
 * libs required when using SystemJS 
 */
const systemjsLibs = [
    'node_modules/systemjs/dist/system.src.js',
];

/**
 * external libs
 */

const extLibs = ['node_modules/lodash/lodash.min.js'];

/**
 * Supported browsers used by autoprefixer
 */
const browsersList = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10',
];

exports.extLibs = extLibs;
exports.libs = libs;
exports.systemjsLibs = systemjsLibs;
exports.project = project;
exports.paths = paths;
exports.browsersList = browsersList;