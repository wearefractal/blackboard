var blackboard = require('../');
var fs = require('fs');
var path = require('path');

var helpFile = fs.readFileSync(path.join(__dirname, 'help.md'));
var lessonFile = fs.readFileSync(path.join(__dirname, 'helloworld.md'));

var shop = new blackboard.Class({
  name: "Workshop Test",
  help: helpFile
});

var helloWorld = new blackboard.Lesson({
  name: "Hello World!",
  instructions: lessonFile,
  setup: function(box, cb){

  },
  validate: function(box, cb){
    
  }
});

var babySteps = new blackboard.Lesson({
  name: "Baby Steps",
  instructions: lessonFile,
  setup: function(cb){

  },
  validate: function(cb){

  }
});

shop.add(helloWorld);
shop.add(babySteps);

shop.start();