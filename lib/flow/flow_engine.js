var events = require('events');
var util = require('util');
var mongo = require('../db/stock_mongo.js');
var Flow = require('../core/flow.js');
var FlowState = require('../core/status.js').FlowState;
var ItemState = require('../core/status.js').ItemState;
var taskProcessor = require('../process/taskProcessor.js');
var log = require('../util/logger.js');
var logger = new log('flow:engine');
logger.enable = false;

var FlowEngine = function() {
    events.EventEmitter.call(this);

    this.flows = [];
    this.isEnd = false;
    var self = this;

    var flowItemChange = function(_item) {
	logger.info('Item Task completed', _item.id);
	var flow = null;
	var i = 0;
	for (;i < self.flows.length; i++)
	{
	    if(self.flows[i] != null && _item.id == self.flows[i]._id)
	    {
		flow = self.flows[i];
		break;
	    }
	}
	
	if (flow != null)
	{
	    flow.updateTask(_item);
	    logger.info('Coninue with flow', flow);
	    self.flows[i] = flow;
	    self.continueFlow(flow);
	    mongo.updateFlow(flow);
	}	
    };

    this.on('change', flowItemChange);
};

util.inherits(FlowEngine, events.EventEmitter);

FlowEngine.prototype.endEngine = function() {
    var flowEnd = true;
    
    this.flows.forEach(function(_flow) {
	if (_flow != null)
	{
	    flowEnd = false;
	}
    });
    
    if(flowEnd && this.isEnd) {
	this.emit('end');
    }	    
};

FlowEngine.prototype.endFlow = function (_flow) {
    var self = this;
    mongo.updateFlow(_flow, function() {
	for (var i = 0;i < self.flows.length; i++)
	{
	    if (self.flows[i] != null && self.flows[i]._id == _flow._id)
	    {
		self.flows[i] = null;
	    }
	}

	logger.info('Flow is ended', _flow.code);

	self.endEngine();
    });    
};

FlowEngine.prototype.continueFlow = function (_flow) {
    var ifFlowEnd = true;
    for (var i = 0;i < _flow.tasks.length; i++)
    {
	var task = _flow.tasks[i];
	if (task.state == ItemState.Initial)
	{
	    taskProcessor.addTask(task);
	    ifFlowEnd = false;
	    break;
	}

	if (task.state == ItemState.Running)
	{
	    ifFlowEnd = false;
	    break;
	}
    }

    if (ifFlowEnd)
    {
	_flow.state = FlowState.Ended;
	this.endFlow(_flow);
    }
};

FlowEngine.prototype.addFlow = function(_flow, callback) {
    var self = this;
    var ifFlowExists = false;
    this.flows.forEach(function(value) {
	if (value && _flow.code == value.code && _flow.operation == value.operation)
	{
	    ifFlowExists = true;
	}
    });
    logger.info('To add flow:', _flow, ifFlowExists);    
    if (!ifFlowExists) {    
	mongo.insertFlow(_flow, function(_inserted) {

	    var ifAdded = false;
	    _flow._id = _inserted._id;
	    for (var j = 0;j < _flow.tasks.length; j++)
	    {
		_flow.tasks[j].id = _inserted._id;
	    }
	    
	    for (var i = 0;i < self.flows.length; i++)
	    {
		if (self.flows[i] == null)
		{
		    ifAdded = true;
		    self.flows[i] = _flow;
		}	    
	    }

	    if (!ifAdded)
	    {
		self.flows.push(_flow);
	    }

	    self.continueFlow(_flow);

	    logger.info('Flow added:', _flow);

	    if (callback) callback();
	});
    } else {
	if (callback) callback();
    }
    
};

var flowEngine = new FlowEngine();

var startEngine = function(_operation, callback) {
    logger.info('Engine Start');
    taskProcessor.startTaskProcessor();
    flowEngine.isEnd = false;
    mongo.getFlows(FlowState.Running, _operation, function (_flows) {
	if(_flows)
	{
	    logger.debug('Load x existing flows', _flows.length);
	    _flows.forEach(function(_flow) {
		var flow = new Flow(_flow.stock);
		flow.operation = _flow.operation;
		flow._id = _flow._id;
		
		_flow.tasks.forEach(function(_task) {
		    _task.id = _flow._id;
		    flow.addTask(_task);
		});
		
		flowEngine.flows.push(flow);

		flowEngine.continueFlow(flow);


	    });	    	    
	}

	if(callback) callback();
    });
};

var endEngine = function(callback) {
    flowEngine.isEnd = true;    
    flowEngine.on('end', function() {
	taskProcessor.endTaskProcessor(function() {
	    if (callback) callback();
	});
    });

    flowEngine.endEngine();
};

var itemEnd = function(_item) {
    flowEngine.emit('change', _item);
};

var addFlow = function(_flow, callback) {
    flowEngine.addFlow(_flow, callback);    
};

module.exports.endEngine = endEngine;
module.exports.startEngine = startEngine;
module.exports.addFlow = addFlow;
module.exports.itemEnd = itemEnd;



    

