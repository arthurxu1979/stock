var mpProcessor = require('../lib/process/analyzeProcessor.js');
var moduleProcessor = require('../lib/process/moduleProcessor.js');
var TaskProcessor = require('../lib/core/status.js').TaskProcessor;
var log = require('../lib/util/logger.js');

var logger = new log('Module Processor');

mpProcessor.initProcessor();
var begin = new Date();
var module_length = 0;
var duration_module = 0;
var duration_5 = 0;
var duration_20 = 0;
var duration_15 = 0;

var startAnalyze = function(_stocks) {
    var stocks = _stocks;
    mpProcessor.startAnalyzeProcessor(TaskProcessor.stock_analyze_5, stocks, function(_duration) {
	duration_5 = _duration;
	mpProcessor.startAnalyzeProcessor(TaskProcessor.stock_analyze_20, stocks, function(_duration) {
	    duration_20 = _duration;
	    mpProcessor.startAnalyzeProcessor(TaskProcessor.stock_analyze_15, stocks, function(_duration) {
		duration_15 = _duration;
		mpProcessor.endProcessor();
		logger.info('Module Result(#, duration):', module_length, duration_module);
		logger.info('Analyze_5 duration:', duration_5/1000);
		logger.info('Analyze_20 duration:', duration_20/1000);
		logger.info('Analyze_15 duration:', duration_15/1000);
	    });
	});
    });    
};

moduleProcessor.startModuleProcessor(function(modules) {
    module_length = modules.length;
    duration_module = new Date().getTime() - begin.getTime();
    var stocks = [];

    modules.forEach(function(module_item){
	stocks.push({stock_code:module_item.stock_code, module:module_item.module});
    });

    startAnalyze(stocks);
});

