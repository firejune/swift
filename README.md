# Swift

OpenStack Object Storage(Swift) REST client API for Node.JS

### Installing

GIT

    $ git clone git://github.com/firejune/swift.git

NPM

    $ npm install swift
    
### Code
    var Swift = require('swift');

    var swift = new Swift({
        user: 'auth-user'
      , pass: 'auth-key'
      , host: 'auth.api.yourcloud.com'
      , port: 443
    }, function(req) {
      if (req.statusCode == 200)
        // success
      else
        // error
    });

    // Authentication
    swift.listContainers(handlerFunction);
    swift.retrieveAccountMetadata(handlerFunction);
    
    // Storage Services
    swift.listObjects(containerName, handlerFunction);
    swift.createContainer(containerName, handlerFunction);
    swift.deleteContainer(containerName, handlerFunction);
    swift.retrieveContainerMetadata(containerName, handlerFunction);

    // Object Services
    swift.retrieveObject(containerName, objectName, handlerFunction);
    swift.createObject(containerName, objectName, handlerFunction);
    swift.copyObject(containerName, destObject, fromContainer, sourceObject, handlerFunction);
    swift.deleteObject(containerName, objectName, handlerFunction);
    swift.retrieveObjectMetadata(containerName, objectName, handlerFunction);
    swift.updateObjectMetadata(containerName, objectName, handlerFunction);
    
    // Get Static Content
    swift.retrieveObject(containerName, objectName, responseObject);