System.config({
  paths: {
    // alias
    'npm:': 'node_modules/'
  },
  // map tells the System loader where to look for things
  map: {
    // our app is within the app folder
    'app': 'dist/app',

    // angular bundles
    '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
    '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
    '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
    '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
    '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
    '@angular/http': 'npm:@angular/http/bundles/http.umd.js',
    '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
    '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js',
    '@angular/upgrade': 'npm:@angular/upgrade/bundles/upgrade.umd.js',

    // other libraries
    'reselect': 'npm:reselect/dist/reselect.js',
    'rxjs': 'npm:rxjs',
    'lodash': 'npm:lodash/lodash.min.js',
    '@ngrx/core': 'npm:@ngrx/core/bundles/core.min.umd.js',
    '@ngrx/store': 'npm:@ngrx/store/bundles/store.min.umd.js',
  },
  // packages tells the System loader how to load when no filename and/or no extension
  packages: {
    'app': { main: 'main.js', defaultExtension: 'js' },
    'rxjs': { defaultExtension: 'js' },
    '@ngrx/core': { defaultExtension: 'js' },
    '@ngrx/store': { defaultExtension: 'js' },
    'reselect': { defaultExtension: 'js' },
    'lodash': { defaultExtension: 'js' },
  }
});
