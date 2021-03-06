'use strict';

const pconfig = require('./project-config');

const config = {

  /*The baseUrl is the URL that webdriver will visit*/
  baseUrl: 'http://localhost:' + pconfig.project.srvPort,

  /* connect to the webdriver instead of connecting to a local Selenium server */
  directConnect: true,

  // Framework to use. Jasmine is recommended.
  framework: 'jasmine',

  // Spec patterns are relative to this config file
  specs: [pconfig.paths.destinations.e2e + '**/*.e2e-spec.js'],


  /* useAllAngular2AppRoots: tells Protractor to wait for any angular2 apps on the page */
  useAllAngular2AppRoots: true,

 onPrepare: function() {
    browser.ignoreSynchronization = false;
  },
  
  /*
  * Options to be passed to jasmine.
  *
  * See https://github.com/jasmine/jasmine-npm/blob/master/lib/jasmine.js
  * for the exact options available.
  */
  jasmineNodeOpts: {
//    defaultTimeoutInterval: 60000,
    showTiming: true,
    showColors: true,
    isVerbose: false,
    includeStackTrace: false,
  },
//  allScriptsTimeout: 11000,
};

/* Capabilities to be passed to the webdriver instance.*/
if (process.env.TRAVIS) {
  config.capabilities = {
    browserName: 'chrome',
    chromeOptions: {
      'args': ['--no-sandbox'],
//      'binary': process.env.CHROME_BIN_PROTRACTOR,
    }
  };
} else {
  config.capabilities = {
    browserName: 'chrome'
  };
}

exports.config = config;