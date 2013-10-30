var EventEmitter = require('events').EventEmitter;
var util = require('util');

var dataFile = require('data-file');
var blessed = require('blessed');
var msee = require('msee');
var argv = require('optimist').argv;

function Class(opt) {
  EventEmitter.call(this);
  if (!opt) opt = {};
  if (!opt.name) throw new Error("Class needs a name");
  
  this.name = opt.name;
  this.help = opt.help;

  this.foreground =  opt.foreground || '#ffffff';
  this.background = opt.background || '#0000ff';

  this.lessons = [];
  this.data = dataFile.create(this.name);
}

util.inherits(Class, EventEmitter);

// Command line options
Class.prototype._help = function(){
  if (!this.help) throw new Error("No help available!");
  console.log(msee.parse(String(this.help)));
};

Class.prototype._list = function(){
  if (this.lessons.length === 0) return console.error('No lessons');

  this.lessons.forEach(function(lesson){
    console.log(lesson.displayName());
  });
};

Class.prototype._menu = function(){
  process.title = this.name;

  // get some colors
  var bg = blessed.colors.match(this.background);
  var fg = blessed.colors.match(this.foreground);

  // create screen
  var menu = blessed.screen({
    term: 'windows-ansi',
    bg: 'black'
  });

  // title bar
  var titleBar = blessed.text({
    top: 0,
    left: 0,
    width: '100%',
    bold: true,
    bg: bg,
    fg: fg,
    content: this.name,
    align: 'center',
    tags: true
  });
  menu.append(titleBar);

  // list of lessons
  var lessonNames = this.lessons.map(function(i){
    return i.displayName();
  });

  var lessonList = blessed.list({
    align: 'center',
    mouse: true,
    keys: true,

    bg: bg,
    fg: fg,
    selectedBg: fg,
    selectedFg: bg,

    border: {
      type: 'ascii',
      fg: 'default',
      bg: 'default'
    },
    width: '75%',
    height: '75%',
    top: 'center',
    left: 'center',

    items: lessonNames,

    scrollbar: {
      ch: ' ',
      track: {
        bg: 'yellow'
      },
      style: {
        inverse: true
      }
    }
  });

  menu.append(lessonList);
  lessonList.select(0);

  // catch keys
  menu.key(['escape', 'q', 'C-c'], function() {
    return process.exit(0);
  });

  // and render
  lessonList.focus();
  menu.render();
};

Class.prototype._parseArgs = function(){

  if (argv.h || argv.help || argv._[0] === 'help')
    return this._help();

  if (argv.ls || argv.list || argv._[0] === 'ls' || argv._[0] === 'list')
    return this._list();

  this._menu();
};

Class.prototype.add = function(lesson) {
  this.lessons.push(lesson);
  return this;
};

Class.prototype.start = function(){
  this._parseArgs();
};

module.exports = Class;