/*!
 * Clog - Colorful console output for your applications in NodeJS
 *
 * Copyright(c) 2011 Firejune <to@firejune.com>
 * MIT Licensed
 */


/**
 * Object to array
 */
 
var toArray = function (enu) {
  var arr = [];

  for (var i = 0, l = enu.length; i < l; i++)
    arr.push(enu[i]);

  return arr;
};


/**
 * Log types and colors.
 * 
 * Black       30
 * Blue        34
 * Green       32
 * Cyan        36
 * Red         31
 * Purple      35
 * Brown       33
 * Light Gray  37
 * 
 */

var types = {
    'log'   : 0
  , 'error' : 31
  , 'warn'  : 33
  , 'info'  : 36
  , 'debug' : 90
};


/**
 * Clog class.
 */

var Clog = function () {

  /**
   * Clog version.
   */

  this.log.version = '0.0.2';

  /**
   * Generate methods.
   */

  var self = this;
  for (var name in types) {
    this.log[name] = (function (name) {
      return function() {
        self.log.apply(self, [name].concat(toArray(arguments)));
      }
    })(name);
  }

  return this.log;
};


/**
 * Log method.
 */

Clog.prototype.log = function (type) {

  console.log.apply(
      console
    , [types[type]
        ? '\033[' + types[type] + 'm' + type + ':\033[39m'
        : type + ':'
      ].concat(toArray(arguments).slice(1))
  );

  return this;
};


/**
 * Export intance of Clog as the module.
 */

module.exports = new Clog;