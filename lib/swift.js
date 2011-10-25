/*!
 * Swift - OpenStack Object Storage(Swift) REST client API for Node.JS
 *
 * @author firejune(to@firejune.com)
 * @license MIT Style
 * 
 */


/**
 * dependencies.
 */

var https = require('https')
  , fs = require('fs')
  , clog = require('clog')
  , wrap = require('wrap');


/**
 * Class.
 */
 
function Swift(options, callback) {
  this.options = extend({
      user: 'username'
    , pass: 'userpass'
    , host: 'hostname'
    , port: 3000
  }, options);

  request.call(this, {
      headers: {
        'X-Storage-User': this.options.user
      , 'X-Storage-Pass': this.options.pass
    }
  }, function(err, res) {
    if (res.headers['x-storage-url'] && res.headers['x-auth-token']) {
      this.account = res.headers['x-storage-url'].split('v1/')[1];
      this.token = res.headers['x-auth-token'];
    }
    callback && callback(err, res);
  }.wrap(this));
}


/**
 * Util.
 */

function extend(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
}

function request(options, callback, _res) {
  options = extend({
      host: this.options.host
    , port: this.options.port
    , path: '/auth/v1.0'
    , method: 'GET'
    , headers: {
        'X-Auth-Token': this.token
      , 'X-Storage-Token': this.token
    }
  }, options);

  options.headers['User-Agent'] = 'Node.JS Swift API Client';
  options.path = encodeURI(options.path);

  var client = https.request(options, function(res) {
    var buffers = [];
    if (_res) {
      _res.header('Content-Length', res.headers['content-length']);
      _res.header('Content-Type', res.headers['content-type']);
    }

    res.on('data', function(buffer) {
      if (_res) _res.write(buffer);
      else buffers.push(buffer);
    });

    res.on('end', function(err){
      buffers.length && clog.info(res.statusCode, res.headers);
      res.body = buffers.join('');
      callback && callback(null, res);
    });
  });

  client.on('error', function(err) {
    callback(err);
  });

  // send binary object to storage
  if (options.data) {
    var boundaryKey = Math.random().toString(16);
    client.setHeader('Content-Type', 'multipart/form-data; boundary="' + boundaryKey + '"');
    client.write( 
      '--' + boundaryKey + '\r\n'
      + 'Content-Type: application/octet-stream\r\n' 
      + 'Content-Disposition: form-data; name="my_file"; filename="' + options.data.name + '"\r\n'
      + 'Content-Transfer-Encoding: binary\r\n\r\n' 
    );

    var readStream = fs.createReadStream(options.data.path, {
      bufferSize: 4 * 1024
    });

    readStream.on('open', function () {
      readStream.pipe(client, {end: false});
    });

    readStream.on('end', function() {
      client.end('--' + boundaryKey + '--'); 
    });

    readStream.on('error', function(err) {
      callback(err);
      client.end();
    });
  } else
    client.end();
}


Swift.prototype.getFile = function(container, object, callback, strime) {
  request.call(this, {
      path: '/v1.0/' + this.account + '/' + container + '/' + object
  }, callback, strime);
};


/**
 * Storage Account Services.
 */

// List Containers
Swift.prototype.listContainers = function(callback) {
  request.call(this, {
      path: '/v1.0/' + this.account + '?format=json'
  }, callback);
};

// Retrieve Account Metadata
Swift.prototype.retrieveAccountMetadata = function(callback) {
  request.call(this, {
      path: '/v1.0/' + this.account
    , method: 'HEAD'
  }, callback);
};


/**
 * Storage Container Services.
 */

// List Objects
Swift.prototype.listObjects = function(object, callback) {
  request.call(this, {
      path: '/v1.0/' + this.account + '/' + object + '?format=json'
  }, callback);
};

// Create Container
Swift.prototype.createContainer = function(container, callback) {
  request.call(this, {
      path: '/v1.0/' + this.account + '/' + container
    , method: 'PUT'
  }, callback);
};

// Delete Container
Swift.prototype.deleteContainer = function(container, callback) {
  request.call(this, {
      path: '/v1.0/' + this.account + '/' + container
    , method: 'DELETE'
  }, callback);
};

// Retrieve Container Metadata
Swift.prototype.retrieveContainerMetadata = function(container, callback) {
  request.call(this, {
      path: '/v1.0/' + this.account + '/' + container
    , method: 'HEAD'
  }, callback);
};


/**
 * Storage Object Services.
 */

// Retrieve Object
Swift.prototype.retrieveObject = function(container, object, callback) {
  request.call(this, {
      path: '/v1.0/' + this.account + '/' + container + '/' + object
  }, callback);
};

// Create Object
Swift.prototype.createObject = Swift.prototype.updateObject = function(data, container, object, callback) {
  if (!data) return clog.error("No data or headers in write request");

  request.call(this, {
      path: '/v1.0/' + this.account + '/' + container + '/' + object
    , method: 'PUT'
    , data: data
    , headers: {
        'X-Auth-Token': this.token
      , 'Content-Type': data.type || "application/octet-stream"
      , 'Content-Length': data.size
    }
  }, callback);
};

// Delete Object
Swift.prototype.deleteObject = function(container, object, callback) {
  request.call(this, {
      path: '/v1.0/' + this.account + '/' + container + '/' + object
    , method: 'DELETE'
  }, callback);
};

// Retrieve Object Metadata
Swift.prototype.retrieveObjectMetadata = function(container, object, callback) {
  request.call(this, {
      path: '/v1.0/' + this.account + '/' + container + '/' + object
    , method: 'HEAD'
  }, callback);
};

// Update Object Metadata
Swift.prototype.updateObjectMetadata = function(container, object, callback) {
  request.call(this, {
      path: '/v1.0/' + this.account + '/' + container + '/' + object
    , method: 'POST'
  }, callback);
};

// Copy Object
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