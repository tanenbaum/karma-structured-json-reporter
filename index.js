var path = require('path');
var fs = require('fs');

function writeOutput(config, output, helper, logger) {

  var log = logger.create('karma-json-result-reporter');

  if (config.outputFile) {
    helper.mkdirIfNotExists(path.dirname(config.outputFile), function() {
      if (config.isSynchronous) {
        log.debug('Writing test results to JSON file ' + config.outputFile);
        try {
          fs.writeFileSync(config.outputFile, JSON.stringify(output, null, 4));
        } catch (err) {
          log.warn('Cannot write test results to JSON file\n\t' + err.message);
        }
      } else {
        fs.writeFile(config.outputFile, JSON.stringify(output, null, 4), function(err) {
          if (err) {
            log.warn('Cannot write test results to JSON file\n\t' + err.message);
          } else {
            log.debug('Test results were written to JSON file ' + config.outputFile);
          }
        });
      }
    });
  } else {
    process.stdout.write(JSON.stringify(output));
  }
}

var JsonResultReporter = function(baseReporterDecorator, formatError, config, helper, logger) {

  baseReporterDecorator(this);

  var logMessageFormater = function(error) {
    return formatError(error)
  };

  this.clear = function() {
    this.results = [];
    this.errors = [];
  };

  this.onBrowserError = function(browser, error) {
    this.errors.push(error);
  };

  this.onSpecComplete = function(browser, result) {
    // convert newlines into array and flatten
    result.log = [].concat.apply([], result.log.map(function (message) {
      return message.split('\n');
    }));
    this.results.push(result);
  };

  this.onRunComplete = function() {
    var output = {
      errors: this.errors.map(logMessageFormater),
      results: this.results
    };

    writeOutput(config, output, helper, logger);

    this.clear();
  };

  this.clear();
};

JsonResultReporter.$inject = ['baseReporterDecorator', 'formatError', 'config.jsonResultReporter', 'helper', 'logger'];

module.exports = {
  'reporter:json-result': ['type', JsonResultReporter]
};
