# Wrap

Wrap is Prototype.js style context wrapping it in another function in NodeJS.

* Tiny!
* Fast!
* Easy!
* Useful!

### Installing

GIT

    $ git clone git://github.com/firejune/wrap.git

NPM

    $ npm install wrap

### Code

    var wrap = require('wrap');
    
    function MyClass() {
      this.value = "Hello World!";
      this.doSomething();
    }

    MyClass.prototype.doSomething = function() {
      //self = this;
      setTimeout(function() {
        //console.log(self.value);
        console.log(this.value);
      }.wrap(this), 100);
    };

    new MyClass();
    //=> "Hello World!"

Have fun!

### License

MIT <3
