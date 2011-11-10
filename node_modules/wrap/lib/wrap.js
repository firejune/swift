/*!
 * Wrap - Prototype.js style context wrapping it in another function
 *
 * Copyright(c) 2011 Firejune <to@firejune.com>
 * MIT Licensed
 */


/**
 * Wrap method.
 */

Function.prototype.wrap = (function(slice){

  return function(context) {
    var self = this;
    if (1 < arguments.length) {
      // extra arguments to send by default
      var $arguments = slice.call(arguments, 1);

      return function () {
        return self.apply(
          context,
          arguments.length ?
            // concat arguments with those received
            $arguments.concat(slice.call(arguments)) :
            // send just arguments, no concat, no slice
            $arguments
          );
      };

    }

    return function () {
      return arguments.length ?
        self.apply(context, arguments) :
        self.call(context);
    };

  };

}(Array.prototype.slice));