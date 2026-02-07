'use strict';

const path = require('path');
const build = require('@microsoft/sp-build-web');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

// Suppress lint warnings for production build
build.addSuppression(/Warning - \[lint\].*/);

// Don't treat warnings as errors
build.warnings = false;

// ============================================
// WEBPACK CONFIGURATION
// Force all packages to use the same React instance
// This fixes React Error 310 (Invalid hook call)
// ============================================
build.configureWebpack.mergeConfig({
  additionalConfiguration: (generatedConfiguration) => {
    // Resolve aliases to ensure single React instance
    if (!generatedConfiguration.resolve) {
      generatedConfiguration.resolve = {};
    }
    if (!generatedConfiguration.resolve.alias) {
      generatedConfiguration.resolve.alias = {};
    }

    // Point all react imports to the same node_modules location
    const reactPath = path.resolve(__dirname, 'node_modules/react');
    const reactDomPath = path.resolve(__dirname, 'node_modules/react-dom');

    generatedConfiguration.resolve.alias['react'] = reactPath;
    generatedConfiguration.resolve.alias['react-dom'] = reactDomPath;

    return generatedConfiguration;
  }
});

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set('serve', result.get('serve-deprecated'));

  return result;
};

build.initialize(require('gulp'));
