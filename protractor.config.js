'use strict';

const config = require('./project-config');

exports.config = {

  /*The baseUrl is the URL that webdriver will visit*/
  baseUrl: 'http://localhost:' + config.project.srvPort,

  /* connect to the webdriver instead of connecting to a local Selenium server */
  directConnect: true,

  /* Capabilities to be passed to the webdriver instance.*/
  capabilities: {
    'browserName': 'chrome'
  },

  // Framework to use. Jasmine is recommended.
  framework: 'jasmine',

  // Spec patterns are relative to this config file
  specs: [config.paths.destinations.e2e + '**/*.e2e-spec.js'],


  /* useAllAngular2AppRoots: tells Protractor to wait for any angular2 apps on the page */
  useAllAngular2AppRoots: true

  /*
  **
     * Options to be passed to jasmine.
     *
     * See https://github.com/jasmine/jasmine-npm/blob/master/lib/jasmine.js
     * for the exact options available.
     *
  jasmineNodeOpts: {
      // showTiming: true,
  //print colors to the terminal
      showColors: true,
      isVerbose: false,
      includeStackTrace: false,
      // defaultTimeoutInterval: 400000
    },
  
    onPrepare: function() {
      browser.ignoreSynchronization = false;
    },
  */
};
