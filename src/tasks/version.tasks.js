'use strict';

/**
 * Versionning tasks
 *
 * @author Harzli Joumen <harzli.joumen@gmail.com>
 */

const gulp = require('gulp'),
    fs = require('fs'),
    semver = require('semver'),
    bump = require('gulp-bump'),
    changelog = require('gulp-conventional-changelog'),
    git = require('gulp-git'),
    runSequence = require('run-sequence').use(gulp),
    gutil = require('gulp-util'),
    errorHandler = require('./errorHandler');

/**
 * Read file
 */
function readFile(fileName) {
    return fs.readFileSync(fileName, 'utf8');
}

/**
 * Read version from package.json
 * 
 * @returns application version
 */
function readVersion() {
    return JSON.parse(readFile('./package.json')).version;
}

/**
 * Increment version with semver
 * 
 * @param version
 * @param semver incremention type
 * @returns new version
 */
function incrementVersion(version, incremention) {
    let relVersion = version.replace('-SNAPSHOT', '');
    switch (incremention) {
        case 'patch':
            return semver.inc(relVersion, 'patch');
        case 'minor':
            return semver.inc(relVersion, 'minor');
        case 'major':
            return semver.inc(relVersion, 'major');
        default:
            process.exit(1);
    }
}

/**
 * Add SNAPSHOT tag to the end of the version
 * 
 * @param version
 * @returns new version
 */
function addSnapshotToVersion(version) {
    return version.concat('-SNAPSHOT');
}

/**
 * Save the new version in package.json
 * 
 * @param release or snapshot
 * @param callback
 * @param semver
 */
function saveVersion(isReleasing, done, incremention = null) {
    let currentVersion = readVersion();
    let newVersion = isReleasing ? incrementVersion(currentVersion, incremention) : addSnapshotToVersion(currentVersion);
    gulp.src(['./package.json'])
        .pipe(bump({ version: newVersion }))
        .on('error', errorHandler.fatal)
        .pipe(gulp.dest('./'))
        .on('end', () => done());
}

/**
 * Save the new version
 */
gulp.task('version:releaseversion', function (done) {
    saveVersion(true, done, gutil.env.type);
});

/**
 * Generates changelog
 */
gulp.task('version:generatechangelog', function () {
    return gulp.src('CHANGELOG.md', {
        buffer: false
    })
        .pipe(changelog({
            preset: 'angular'
        }))
        .pipe(gulp.dest('./'));
});

/**
 * Commit the new version and push changes to server
 */
gulp.task('version:pushnewversion', function (done) {
    let version = readVersion();
    gulp.src(['package.json', 'CHANGELOG.md'])
        .pipe(git.add())
        .pipe(git.commit('[Released] version: ' + version))
        .on('end', () => {
            git.push('origin', 'master', done);
        });
});

/**
 * Create and push tag
 */
gulp.task('version:tag', function (done) {
    let version = readVersion();
    git.tag(version, 'Created Tag for version: ' + version, function () {
        git.push('origin', 'master', { args: '--tags' }, done);
    });
});


/**
 * Save the snapshot version
 */
gulp.task('version:snapshotversion', function (done) {
    saveVersion(false, done);
});

/**
 * Commit the snapshot version and push changes to server
 */
gulp.task('version:commitsnapshotversion', function (done) {
    gulp.src(['package.json'])
        .pipe(git.add())
        .pipe(git.commit('[Dev] changed version'))
        .on('end', () => {
            git.push('origin', 'master', done);
        });
});

/**
 * Release the new application
 */
gulp.task('version:release', function (done) {
    runSequence(
        'version:releaseversion',
        'version:generatechangelog',
        'version:pushnewversion',
        'version:tag',
        'version:snapshotversion',
        'version:commitsnapshotversion',
        function (error) {
            if (error) {
                errorHandler.fatal;
            }
            done(error);
        });
});
