var Processor = require('./Processor.js');
var db = require('../db/stock_pg.js');
var sf = require('../stocks/stock_flow.js');
var ProcessItem = require('../core/ProcessItem.js');
var FlowOperation = require('../core/status.js').FlowOperation;

var startImportProcessor = function(callback) {
    var stockDB = new db();
    stockDB.open();

    var getStockList = function (stockDatas) {
	var stocks = [];
	stockDatas.forEach(function(_stock) {	    
	    stocks.push(new ProcessItem(new sf( _stock, FlowOperation.flow_import), _stock.stock_code));
	});
	stockDB.close();

	var ps = new Processor(stocks, 'flowProcessor');
	ps.threads = 10;
	ps.on('end', callback);
	ps.start();
	ps.end();
    };

    stockDB.queryStockList(getStockList);
};

var startFlowProcessor = function(callback) {
    var stockDB = new db();
    stockDB.open();

    var getStockList = function (stockDatas) {
	var stocks = [];
	stockDatas.forEach(function(_stock) {	    
	    stocks.push(new ProcessItem(new sf( _stock, FlowOperation.flow_init), _stock.stock_code));
	});
	stockDB.close();

	var ps = new Processor(stocks, 'flowProcessor');
	ps.threads = 10;
	ps.on('end', callback);
	ps.start();
	ps.end();
    };

    stockDB.queryStockList(getStockList);
};

var startAnalyzeProcessor = function() {
    var stockDB = new db();
    stockDB.open();

    var getStockList = function (stockDatas) {
	var stocks = [];
	stockDatas.forEach(function(_stock) {	    
	    stocks.push(new ProcessItem(new sf( _stock, FlowOperation.flow_analyze), _stock.stock_code));
	});
	stockDB.close();

	var ps = new Processor(stocks);
	ps.threads = 2;
	ps.start();
	ps.end();
    };

    stockDB.queryStockListForMP(getStockList);
};

module.exports.startFlowProcessor = startFlowProcessor;
module.exports.startImportProcessor = startImportProcessor;
