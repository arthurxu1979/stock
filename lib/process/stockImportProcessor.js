var ProcessItem = require('../core/ProcessItem.js');
var stockDB = require('../db/stock_pg.js');
var mongo = require('../db/stock_mongo.js');
var si = require('../stocks/stock_import.js');
var Processor = require('./Processor.js');
var log = require('../util/logger.js');
var util = require('util');

var logger = new log('processor:stockimport');

var startImportProcessor = function () {
        var db = new stockDB();

    var getStockList = function (stockDatas){
	var stocks = [];
	var ps = null;

	for (var i = 0;i < stockDatas.length; i++)
	{
	    var code = stockDatas[i].stock_code;	    
	    var stock = new ProcessItem(new si(code), code);

	    stocks.push(stock);
	}
	db.close();

	ps  = new Processor(stocks);

	ps.start();
	ps.end();
    };

    db.open();
    db.queryStockList(getStockList);
};

module.exports.startImportProcessor = startImportProcessor;
