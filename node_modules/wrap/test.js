require('./lib/wrap');

function MyClass() {
  this.value = "Hello World!";
  this.doSomething();
}

MyClass.prototype.doSomething = function() {
  // self = this;
  setTimeout(function() {
    // console.log(self.value);
    console.log(this.value);
  }.wrap(this), 100);
};

new MyClass();
//=> "Hello World!"