var ProcessItem = require('../core/ProcessItem.js');
var stockDB = require('../db/stock_pg.js');
var sf = require('../stocks/stockFile.js');
var Processor = require('./Processor.js');
var log = require('../util/logger.js');
var util = require('util');

var logger = new log('processor:file');

var startFileProcessor = function (ifTrans, transDate) {
    var db = new stockDB();

    var getStockList = function (stockDatas){
	var stocks = [];
	var ps = null;

	for (var i = 0;i < stockDatas.length; i++)
	{
	    var code = stockDatas[i].stock_code;
	    var lastDate = stockDatas[i].last_date;
	    
	    var stock = new ProcessItem(new sf(code, lastDate), code);

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

module.exports.startFileProcessor = startFileProcessor;
