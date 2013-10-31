var EventEmitter = require('events').EventEmitter;
var util = require('util');

var dataFile = require('data-file');
var blessed = require('blessed');
var msee = require('msee');
var argv = require('optimist').argv;

var isWin = !!process.platform.match(/^win/);

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

// clear the menu
Class.prototype.clearMenu = function(){
  if (this.menu) {
    if (this.menu.program.scrollTop !== 0 || this.menu.program.scrollBottom !== this.menu.rows - 1) {
      this.menu.program.csr(0, this.menu.height - 1);
    }
    this.menu.program.clear();
    this.menu.program.showCursor();
    this.menu.program.normalBuffer();
    if (this.menu._listenedMouse) {
      this.menu.program.disableMouse();
    }
    this.menu.program.flush();
  }
  return this;
};

Class.prototype._lessonInfo = function(lesson){
  if (!lesson.instructions) throw new Error("No lesson instructions available!");
  this.clearMenu();
  console.log(msee.parse(String(lesson.instructions)));
};

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
  this.menu = blessed.screen({
    term: (isWin ? 'windows-ansi' : null)
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
  this.menu.append(titleBar);

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
      type: 'line',
      fg: 'default',
      bg: 'default'
    },
    width: '90%',
    height: '80%',
    top: 'center',
    left: 'center',

    items: lessonNames,

    scrollbar: {
      ch: ' ',
      track: {
        bg: 'red'
      },
      style: {
        inverse: true
      }
    }
  });

  lessonList.on('select', function(e, idx){
    this.emit('select', this.lessons[idx]);
    this._onselect(this.lessons[idx]);
  }.bind(this));

  this.menu.append(lessonList);
  lessonList.select(0);

  // list label
  lessonList.prepend(blessed.text({
    left: 2,
    content: ' Lessons '
  }));

  // catch keys
  this.menu.key(['escape', 'q', 'C-c'], function() {
    process.exit(0);
  });

  // and render
  lessonList.focus();
  this.menu.render();
};

Class.prototype._onselect = function(lesson){
  this._lessonInfo(lesson);
  return this;
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