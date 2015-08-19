var mpProcessor = require('../lib/process/transMPAllProcessor.js');
var TaskProcessor = require('../lib/core/status.js').TaskProcessor;

mpProcessor.startTransMP(TaskProcessor.stock_analyze_5);
