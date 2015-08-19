var mpProcessor = require('../lib/process/analyzeProcessor.js');
var TaskProcessor = require('../lib/core/status.js').TaskProcessor;
var log = require('../lib/util/logger.js');

var logger = new log('MP Processor');
var stocks = [];
var duration_5 = 0;
var duration_20 = 0;
var duration_15 = 0;

stocks.push({stock_code:'SH601628', module:'Manual'});

mpProcessor.initProcessor();
mpProcessor.startProcessor(TaskProcessor.stock_analyze_5, stocks, function(_duration) {
    duration_5 = _duration;
    mpProcessor.startProcessor(TaskProcessor.stock_analyze_20, stocks, function(_duration) {
	duration_20 = _duration;
	mpProcessor.startProcessor(TaskProcessor.stock_analyze_15, stocks, function(_duration) {
	    duration_15 = _duration;
	    mpProcessor.endProcessor();
	    logger.info('Analyze_5 duration:', duration_5/1000);
	    logger.info('Analyze_20 duration:', duration_20/1000);
	    logger.info('Analyze_15 duration:', duration_15/1000);
	});
    });

});
