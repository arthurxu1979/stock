var events = require('events');
var util = require('util');
var Flow = require('../core/flow.js');
var engine = require('../flow/flow_engine.js');
var TaskProcessor = require('../core/status.js').TaskProcessor;
var FlowOperation = require('../core/status.js').FlowOperation;
var logger = new require('../util/logger.js')('stocks:flow');

var StockFlow = function(_stock, _flow_type) {
    events.EventEmitter.call(this);
    this.stock = _stock;
    this.flowType = _flow_type;
};

util.inherits(StockFlow, events.EventEmitter);

StockFlow.prototype.start = function() {
    var self = this;
    var endAdded = function () {
	self.emit('end');
    };

    switch(this.flowType)
    {
	case FlowOperation.flow_import:
	this.generateStockImport(endAdded);
	break;
	case FlowOperation.flow_init:
	this.generateStockFlow(endAdded);
	break;
    }    
};

StockFlow.prototype.generateStockImport = function(callback) {
    var f = new Flow(this.stock);
    f.operation = FlowOperation.flow_import;
    
    var fileTask = new Object();
    fileTask.processor = TaskProcessor.stock_file;
    fileTask.stock_code = this.stock.stock_code;
    f.addTask(fileTask);

    var importTask = new Object();
    importTask.processor = TaskProcessor.stock_import;
    importTask.stock_code = this.stock.stock_code;
    f.addTask(importTask);

    engine.addFlow(f, callback);
};

StockFlow.prototype.generateStockFlow = function(callback) {
    var f = new Flow(this.stock);
    f.operation = FlowOperation.flow_init;

    var initTask = new Object();
    initTask.processor = TaskProcessor.stock_init_5;
    initTask.stock_code = this.stock.stock_code;
    f.addTask(initTask);

    var initTask20 = new Object();
    initTask20.processor = TaskProcessor.stock_init_20avg;
    initTask20.stock_code = this.stock.stock_code;
    f.addTask(initTask20);

    var initTask15 = new Object();
    initTask15.processor = TaskProcessor.stock_init_15;
    initTask15.stock_code = this.stock.stock_code;
    f.addTask(initTask15);

    engine.addFlow(f, callback);
};

module.exports = StockFlow;
