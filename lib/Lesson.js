var EventEmitter = require('events').EventEmitter;
var util = require('util');

var dataFile = require('data-file');

function Lesson(opt) {
  EventEmitter.call(this);
  if (!opt) opt = {};
  if (!opt.name) throw new Error("Lesson needs a name");
  this.name = opt.name;

  this.data = dataFile.create(this.name+"-lesson");
  this.completed = this.data.get("completed") || false;
  this.current = this.data.get("current") || false;
}

util.inherits(Lesson, EventEmitter);

Lesson.prototype.displayName = function(){
  var status;
  if (this.completed) {
    status = "[COMPLETED]";
  } else if (this.current) {
    status = "[IN PROGRESS]";
  } else {
    status = "[TODO]";
  }
  return this.name + " " + status;
};

module.exports = Lesson;