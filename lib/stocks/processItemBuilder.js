var log = require('../util/logger.js');
var TaskProcessor = require('../core/status.js').TaskProcessor;
var sf = require('./stock_file.js');
var si = require('./stock_import.js');
var sint = require('./stock_init.js');
var ProcessItem = require('../core/ProcessItem.js');
var logger = new log('stock:itembuilder');

var processItemBuild = function(itemTask, _code) {
    var processItem = null;
    logger.debug('Item Task', itemTask);
    
    switch(itemTask.processor)
    {
	case TaskProcessor.stock_file:
	processItem = new ProcessItem(new sf(_code), _code);
	break;
	case TaskProcessor.stock_import:
	processItem = new ProcessItem(new si(_code), _code);
	break;
	case TaskProcessor.stock_init_5:
	case TaskProcessor.stock_init_20avg:
	case TaskProcessor.stock_init_15:
	processItem = new ProcessItem(new sint(_code, itemTask.processor), _code);	
	break;
    }

    if (processItem)
    {
	processItem.id = itemTask.id;
	processItem.processor = itemTask.processor;
    }
    
    return processItem;
};

module.exports.processItemBuild = processItemBuild;






    
