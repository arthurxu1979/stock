var events = require('events');
var util = require('util');
var mongo = require('../db/stock_mongo.js');
var builder = require('../analyze/analyzeBuilder.js');
var log = require('../util/logger.js');
var logger = new log('stock:analyze_repo');

var results = [];
var AnalyzeRepo = function(code, processor,_stockList) {
    events.EventEmitter.call(this);
    this.code = code;
    this.processor = processor;
    this.stockList = _stockList;
};

util.inherits(AnalyzeRepo, events.EventEmitter);

AnalyzeRepo.prototype.start = function () {
    var self = this;
    var analyze = builder.buildAnalyze(this.processor);
    mongo.getOneStock(this.code, analyze.getCollection(), function(_stocks){
	if (_stocks)
	{
	    var result = analyze.mapAll(self.stockList, _stocks);
	    result.forEach(function(_r) {
		results.push(_r);
	    });
	}

	self.emit('end');
    });
};

AnalyzeRepo.prototype.result = function() {
    return results;    
};

AnalyzeRepo.prototype.reset = function() {
    while(results.length>0) results.pop();
};

module.exports = AnalyzeRepo;
