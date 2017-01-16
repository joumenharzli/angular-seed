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
    return semver.inc(version.replace('-SNAPSHOT', ''), incremention);
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
        .on('error', erroHandler.fatal)
        .pipe(gulp.dest('./'))
        .on('end', () => done());
}

/**
 * Save the new version
 */
gulp.task('version:releaseversion', function (done) {
    return saveVersion(true, done, gutil.env);
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
    gulp.src(['package.json', 'CHANGELOG.md'])
        .pipe(git.add())
        .pipe(git.commit('[Prerelease] changed version'))
        .on('end', () => {
            git.push('origin', 'master', done);
        });
});

/**
 * Create and push tag
 */
gulp.task('version:tag', function (done) {
    var version = readVersion();
    git.tag(version, 'Created Tag for version: ' + version, errorHandler.warning);
    git.push('origin', 'master', { args: '--tags' }, done);
});

/**
 * Commit the snapshot version and push changes to server
 */
gulp.task('version:snapshotversion', function (done) {
    saveVersion(false, done);
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
        function (error) {
            if (error) {
                errorHandler.fatal;
            }
            done(error);
        });
});
