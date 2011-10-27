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
  , crypto = require('crypto')
  , clog = require('clog')
  , wrap = require('wrap')

  , MultipartParser = require('./multipart_parser').MultipartParser;


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

function request(options, callback, pipe) {
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
    if (pipe && pipe.res) {
      pipe.res.header('Content-Length', res.headers['content-length']);
      pipe.res.header('Content-Type', res.headers['content-type']);
    }

    if (!pipe || pipe && pipe.res) {
      res.on('data', function(buffer) {
        if (pipe && pipe.res) pipe.res.write(buffer);
        else buffers.push(buffer);
      });
  
      res.on('end', function(err){
        res.body = buffers.join('');
        callback && callback(err, res);
      });
    }

    res.on('end', function(err){
      clog.info(res.statusCode, options.path, res.headers);
    });
  });

  client.on('error', function(err) {
    callback && callback(err);
    client.end();
  });

  if (!pipe || pipe && pipe.res) return client.end();

  var bytesReceived = 0
    , parser = multipart.call(extend(options, {
      onPartData: function(buffer) {
        client.write(buffer);
      },
      onEnd: function() {
        client.end();
        callback && callback();
      }
    }));

  pipe.req.on('data', function(buffer) {
    var bytesParsed = parser.write(buffer);
    if (bytesParsed !== buffer.length)
      clog.error('parser error, ' + bytesParsed + ' of ' + buffer.length + ' bytes parsed');

    pipe.req.emit('progress', bytesReceived += buffer.length, options.headers['Content-Length']);
  });
}

function fileName(headerValue) {
  var m = headerValue.match(/filename="(.*?)"($|; )/i)
  if (!m) return;

  var filename = m[1].substr(m[1].lastIndexOf('\\') + 1);
  filename = filename.replace(/%22/g, '"');
  filename = filename.replace(/&#([\d]{4});/g, function(m, code) {
    return String.fromCharCode(code);
  });

  return filename;
}

function multipart() {
  var parser = new MultipartParser()
    , self = this
    , headerField
    , headerValue
    , part = {};

  parser.initWithBoundary(this.boundary);

  parser.onPartBegin = function() {
    part.headers = {};
    part.name = null;
    part.filename = null;
    part.mime = null;
    headerField = '';
    headerValue = '';
  };

  parser.onHeaderField = function(b, start, end) {
    headerField += b.toString(self.encoding, start, end);
  };

  parser.onHeaderValue = function(b, start, end) {
    headerValue += b.toString(self.encoding, start, end);
  };

  parser.onHeaderEnd = function() {
    headerField = headerField.toLowerCase();
    part.headers[headerField] = headerValue;

    var name = headerValue.match(/name="([^"]+)"/i);
    if (headerField == 'content-disposition') {
      if (name) {
        part.name = name[1];
      }
      part.filename = fileName(headerValue);
    } else if (headerField == 'content-type') {
      part.mime = headerValue;
    }

    headerField = '';
    headerValue = '';
  };

  parser.onHeadersEnd = function() {
    self.onPart && self.onPart(part);
  };

  parser.onPartData = function(b, start, end) {
    self.onPart && self.onPart(b.slice(start, end));
  };

  parser.onPartEnd = function() {
    self.onPartEnd && self.onPartEnd();
  };

  parser.onEnd = function() {
    self.onEnd && self.onEnd();
  };
  
  return parser;
}


Swift.prototype.getFile = function(container, object, callback, res) {
  request.call(this, {
      path: '/v1.0/' + this.account + '/' + container + '/' + object
  }, callback, {
      res: res
  });
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
Swift.prototype.createObject = Swift.prototype.updateObject = function(container, object, callback, req) {
  var boundary = req.headers['content-type'].match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  request.call(this, {
      path: '/v1.0/' + this.account + '/' + container + '/' + object
    , method: 'PUT'
    , filename: object
    , encoding: 'utf-8'
    , boundary: boundary[1] || boundary[2]
    , headers: {
        'X-Auth-Token': this.token
      , 'Content-Length': req.headers['content-length']
      //, 'Content-Type': req.headers['content-type']
      //, 'ETag': crypto.createHash('md5').update(container + '/' + object).digest('hex')
      , 'Transfer-Encoding': 'chunked'
      //, 'X-Object-Meta-PIN': 1234
    }
  }, callback, {
      req: req
  });
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