/*!
 * Swift - OpenStack Object Storage(Swift) REST client API for Node.JS
 *
 * Copyright(c) 2011 Firejune <to@firejune.com>
 * MIT Licensed
 */
 
var https = require('https')
  , clog = require('clog')
  , wrap = require('wrap');


/*
 * Class.
 */
 
function Swift(options, callback) {
  this.options = extend({
      user: 'username'
    , pass: 'userpass'
    , host: 'hostname'
    , port: 80
  }, options);

  request.call(this, {
      headers: {
        'X-Storage-User': this.options.user
      , 'X-Storage-Pass': this.options.pass
    }
  }, function(res, result) {
    if (res.statusCode == 200) {
      this.account = res.headers['x-storage-url'].split('v1/')[1];
      this.token = res.headers['x-auth-token'];
    }
    callback && callback(res);
  }.wrap(this));
}


/*
 * Util.
 */

function extend(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
};


function request(options, callback) {
  options = extend({
      host: this.options.host
    , port: this.options.port
    , path: '/auth/v1.0'
    , method: 'GET'
    , headers: {'X-Auth-Token': this.token}
  }, options);

  var req = https.request(options, function(res) {
    if (options.method == 'DELETE') return callback && callback(res);
    res.on('data', function(buffer) {
      clog.info(res.statusCode, res.headers, buffer.toString());

      var result = buffer.toString();
      try {
        result = JSON.parse(result);
      } catch(e) {}

      callback && callback(res, result);
    });
  });

  req.end();
  
  req.on('error', function(e) {
    clog.error(e);
  });
};


/*
 * Storage Account Services
 */

/* List Containers */
Swift.prototype.listContainers = function(callback) {
  request.call(this, {
      path: '/v1.0/' + this.account + '?format=json'
  }, callback);
};

/* Retrieve Account Metadata */
Swift.prototype.retrieveAccountMetadata = function(callback) {
  request.call(this, {
      path: '/v1.0/' + this.account
    , method: 'HEAD'
  }, callback);
};


/*
 * Storage Container Services
 */

/* List Objects */
Swift.prototype.listObjects = function(object, callback) {
  request.call(this, {
      path: '/v1.0/' + this.account + '/' + object + '?format=json'
  }, callback);
};

/* Create Container  */
Swift.prototype.createContainer = function(container, callback) {
  request.call(this, {
      path: '/v1.0/' + this.account + '/' + container
    , method: 'PUT'
  }, callback);
};

/* Delete Container */
Swift.prototype.deleteContainer = function(container, callback) {
  request.call(this, {
      path: '/v1.0/' + this.account + '/' + container
    , method: 'DELETE'
  }, callback);
};

/* Retrieve Container Metadata */
Swift.prototype.retrieveContainerMetadata = function(container, callback) {
  request.call(this, {
      path: '/v1.0/' + this.account + '/' + container
    , method: 'HEAD'
  }, callback);
};


/*
 * Storage Object Services
 */

/* Retrieve Object */
Swift.prototype.retrieveObject = function(container, object, callback) {
  request.call(this, {
      path: '/v1.0/' + this.account + '/' + container + '/' + object
  }, callback);
};

/* Create Object  */
Swift.prototype.createObject = Swift.prototype.updateObject = function(container, object, callback) {
  request.call(this, {
      path: '/v1.0/' + this.account + '/' + container + '/' + object
    , method: 'PUT'
    , headers: {
        'X-Auth-Token': this.token
      , 'ETag': '8a964ee2a5e88be344f36c22562a6486'
      , 'Content-Length': 12334
      , 'X-Object-Meta-PIN': 1234
      //, Transfer-Encoding: chunked
    }
  }, callback);
};

// Assigning CORS Headers to Requests
// Enabling File Compression with the Content-Encoding Header
// Enabling Browser Bypass with the Content-Disposition Header


/* Delete Object */
Swift.prototype.deleteObject = function(container, object, callback) {
  request.call(this, {
      path: '/v1.0/' + this.account + '/' + container + '/' + object
    , method: 'DELETE'
  }, callback);
};

/* Retrieve Object Metadata */
Swift.prototype.retrieveObjectMetadata = function(container, object, callback) {
  request.call(this, {
      path: '/v1.0/' + this.account + '/' + container + '/' + object
    , method: 'HEAD'
  }, callback);
};

/* Update Object Metadata */
Swift.prototype.updateObjectMetadata = function(container, object, callback) {
  request.call(this, {
      path: '/v1.0/' + this.account + '/' + container + '/' + object
    , method: 'POST'
  }, callback);
};

/* Copy Object */
Swift.prototype.copyObject = function(container, destObject, fromContainer, sourceObject, callback) {
  request.call(this, {
      path: '/v1.0/' + this.account + '/' + container + '/' + destObject
    , method: 'PUT'
    , headers: {
        'X-Auth-Token': this.token
      , 'X-Copy-From': fromContainer + '/' + sourceObject
    }
  }, callback);
};

module.exports = Swift;