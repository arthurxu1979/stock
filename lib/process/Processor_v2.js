var util = require('util');
var events = require('events');
var log= new require('../util/logger.js');
var item = require('../core/ProcessItem.js');
var ItemState = require('../core/status.js').ItemState;

var logger = null;

/*
General processor to do the process in multi threads.
Every time it will start n=threads number of threads to process each item.
*/
var defaultWaitInterval = 100;

var Processor = function(processItems, name) {
    events.EventEmitter.call(this);
    this.items = [];
    if (processItems) this.items = processItems;
    this.loopIndex = 0;
    this.isEnd = false;
    this.threads = 5;
    logger = new log('Processor:' + name);
};

util.inherits(Processor, events.EventEmitter);

Processor.prototype.start = function () {
    var self = this;
    this.emit('start');
    var prevDate = new Date();

    var isItemLoaded = function (m) {
	if (m == null || m.getState() == ItemState.Loaded)
	{
	    return true;
	}

	return false;
    };

    var processItem = function() {
    };    
    
    var loadItem = function () {
	var started = 0;
	var curDate = new Date();
	var interval = defaultWaitInterval - (curDate.getTime() - prevDate.getTime());
	if (interval <=0)
	{
	    interval = 10;
	}

	prevDate = curDate;
	    
	for (;self.loopIndex < self.items.length; self.loopIndex++)
	{
	    if (!isItemLoaded(self.items[self.loopIndex]))
	    {
		break;
	    } else {
		logger.info('Task Loaded:', self.items[self.loopIndex].name, self.items[self.loopIndex].processor, self.loopInfex);
	    }
	}

	for (var i = self.loopIndex; i < self.items.length; i++)
	{
	    if (self.items[i] != null)
	    {
		var item = self.items[i];
		if (item.isRunning())
		{
		    started ++;
		}

		if (item.isError())
		{
		    logger.info('Item Retry ', item.name);
		    item.retry();
		}

		if (item.isInit())
		{
		    item.start();
		    started ++;
		    logger.info('Task Started ', started, self.loopIndex, i, item.name, self.items.length, self.threads, item.processor)
		}

		if (started >= self.threads)
		{
		    break;
		}
	    }
	}
    };

    processItem();
};

Processor.prototype.end = function () {
    var self = this;
    this.isEnd = true;
    
    var endItem = function() {
	if (self.loopIndex < self.items.length || !self.isEnd) {
	    setTimeout(endItem, defaultWaitInterval);
	} else {
	    logger.info('Process is End');
	    self.emit('end');	    
	}	
    };

    endItem();
};

Processor.prototype.addItem = function (item) {
    this.items.push(item);
};

module.exports = Processor;



		    
