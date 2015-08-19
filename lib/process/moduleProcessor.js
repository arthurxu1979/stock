var Processor = require('./Processor.js');
var stock_module = require('../stocks/stock_module.js');
var moduleType = require('../core/enum.js').ModuleAnalyzeType;
var moduleRepo = require('../module/moduleRepo.js');
var db = require('../db/stock_pg.js');
var ProcessItem = require('../core/ProcessItem.js');

var startModuleProcessor = function (endCallback) {
    var stockDB = new db();
    stockDB.open();

    var endModuleProcess = function() {
	var codes = moduleRepo.getRepoCodes();
	if (endCallback) endCallback(codes);
	stockDB.close();
    };

    var getStockList = function(_stocks) {
	var stocks = [];
	_stocks.forEach(function(_stock) {
	    stocks.push(new ProcessItem(new stock_module(_stock.stock_code, moduleType.double_bottom),_stock.stock_code));
	});

	var ps = new Processor(stocks, 'moduleProcessor');
	ps.threads = 20;
	ps.on('end', endModuleProcess);
	ps.start();
	ps.end();
    };

    stockDB.queryStockList(getStockList);
};

module.exports.startModuleProcessor = startModuleProcessor;
