var EventEmitter = require('events').EventEmitter;
var util = require('util');

var dataFile = require('data-file');
var puzzleBox = require('puzzle-box');

function Lesson(opt) {
  EventEmitter.call(this);
  if (!opt) opt = {};

  if (!opt.name) throw new Error("Lesson needs a name");
  if (!opt.setup) throw new Error("Lesson needs a setup function");
  if (!opt.validate) throw new Error("Lesson needs a validate function");
  if (!opt.instructions) throw new Error("Lessons needs instructions");

  this.name = opt.name;
  this.setup = opt.setup.bind(this);
  this.validate = opt.validate.bind(this);
  this.instructions = opt.instructions;
  
  this.data = dataFile.create(this.name+"-lesson");
  this.completed = this.data.get("completed") || false;
  this.current = this.data.get("current") || false;
}

util.inherits(Lesson, EventEmitter);

Lesson.prototype.displayName = function(){
  var status;
  if (this.completed) {
    status = "COMPLETED";
  } else if (this.current) {
    status = "IN PROGRESS";
  } else {
    status = "TODO";
  }
  return this.name + " [" + status + "]";
};

// build sandbox and run the code
Lesson.prototype.run = function(code, cb) {
  var box = puzzleBox.create();
  box.code(code);
  this.setup(box, function(err){
    if (err) return cb(err);
    box.run();
    test.on('finished', function(){
      cb(null, box);
    });
  });
};

Lesson.prototype.start = function() {
  this.run(function(err, box){
    if (err) return cb(err);
    this.validate(box, function(err){

    });
  });
};

module.exports = Lesson;