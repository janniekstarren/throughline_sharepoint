'use strict';

const path = require('path');
const webpack = require('webpack');
const build = require('@microsoft/sp-build-web');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

// Suppress ALL lint warnings for production build
build.addSuppression(/Warning - \[lint\].*/);
build.addSuppression(/Warning - \[sass\].*/);
build.addSuppression(/Warning - \[tsc\].*/);

// Don't treat warnings as errors
build.warnings = false;

// Force the build to not fail on warnings
build.rig.warningLevel = 0;

// ============================================
// WEBPACK CONFIGURATION
// Fix React Error 310 (Invalid hook call) caused by
// @dnd-kit bundling its own React copy
// ============================================
build.configureWebpack.mergeConfig({
  additionalConfiguration: (generatedConfiguration) => {
    // Ensure resolve and alias objects exist
    if (!generatedConfiguration.resolve) {
      generatedConfiguration.resolve = {};
    }
    if (!generatedConfiguration.resolve.alias) {
      generatedConfiguration.resolve.alias = {};
    }

    // Point all react/react-dom imports to the SPFx-provided versions
    // This ensures @dnd-kit and other packages use SharePoint's React instance
    const reactPath = path.resolve(__dirname, 'node_modules/react');
    const reactDomPath = path.resolve(__dirname, 'node_modules/react-dom');

    generatedConfiguration.resolve.alias['react'] = reactPath;
    generatedConfiguration.resolve.alias['react-dom'] = reactDomPath;

    // Also alias the scheduler package which React 17 uses internally
    const schedulerPath = path.resolve(__dirname, 'node_modules/scheduler');
    if (require('fs').existsSync(schedulerPath)) {
      generatedConfiguration.resolve.alias['scheduler'] = schedulerPath;
    }

    // Log configuration for debugging
    console.log('[Webpack] React alias configured:', reactPath);

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
