var log = require('../util/logger.js');
var flowEngine = require('../flow/flow_engine.js');
var ItemState = require('./status.js').ItemState;
var logger = new log('process_item');
logger.configureLevel('info');

var MAX_RETRY = 3;

var ProcessItem = function(obj, name) {
    var self = this;
    this.state = ItemState.Initial;
    this.retried = 0;
    this.innerObj = obj;
    this.name = name;
    this.id = null;
    this.operation = null;
    
    this.innerObj.on('end', function () {
	logger.debug('Item End', self.name, self.processor);
	self.state = ItemState.Ended;
	flowEngine.itemEnd(self);
    });
    
    this.innerObj.on('fail', function () {
	self.state = ItemState.Error;

    });
};

ProcessItem.prototype.start = function () {
    this.state = ItemState.Running;
    this.innerObj.start();
};

ProcessItem.prototype.load = function () {
    this.state = ItemState.Loaded;
    this.innerObj.load();
};

ProcessItem.prototype.getState = function () {
    return this.state;
};

ProcessItem.prototype.isEnd = function () {
    return this.state == ItemState.Ended;
};

ProcessItem.prototype.isRunning = function() {
    return this.state == ItemState.Running;
};

ProcessItem.prototype.isError = function () {
    return this.state == ItemState.Error;
};

ProcessItem.prototype.isInit = function () {
    return this.state == ItemState.Initial;
};

ProcessItem.prototype.retry = function () {
    if (this.retried < MAX_RETRY)
    {
	this.state = ItemState.Running;
	this.innerObj.start();

	this.retried++;
    } else {
	this.state = ItemState.Ended;
	this.innerObj.emit('end');
    }
};

module.exports = ProcessItem;

    


