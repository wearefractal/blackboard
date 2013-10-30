var blackboard = require('../');
var fs = require('fs');
var path = require('path');

var helpFile = fs.readFileSync(path.join(__dirname, 'help.md'));

var shop = new blackboard.Class({
  name: "Workshop Test",
  help: helpFile
});

var helloWorld = new blackboard.Lesson({
  name: "Hello World!"
});

var babySteps = new blackboard.Lesson({
  name: "Baby Steps"
});

shop.add(helloWorld);
shop.add(babySteps);

shop.start();