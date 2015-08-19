var builder = require('../stocks/processItemBuilder.js');
var Processor = require('./Processor.js');

var ps = null;
var processStarted = false;

var startTaskProcessor = function (_tasks) {
    if (ps == null) ps = new Processor(null, 'taskProcessor');

    if(_tasks)
    {
	for (var i = 0; i < _tasks.length; i++)
	{
	    var item = builder.processItemBuild(_tasks[i], _tasks[i].stock_code);
	    item.processor = _tasks[i].processor;
	    ps.addItem(item);
	    
	}
    }

    var processStart = function () {
	processStarted = true;
    };

    if (!processStarted)
    {
	ps.on('start', processStart);
	ps.threads = 5;

	ps.start();
	
    }	
};

var endTaskProcessor = function (callback) {
    if (ps)
    {
	ps.on('end', function() {
	    processStarted = false;
	    if (callback) callback();
	});
	ps.end();
    }
};

var addTask = function(_task) {
    if (ps) ps.addItem(builder.processItemBuild(_task, _task.stock_code));
};

module.exports.addTask = addTask;
module.exports.endTaskProcessor = endTaskProcessor;
module.exports.startTaskProcessor = startTaskProcessor;


