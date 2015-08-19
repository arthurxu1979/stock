var ProcessItem = require('../core/ProcessItem.js');
var TaskProcessor = require('../stocks/processItemBuilder.js').TaskProcessor;
var stockDB = require('../db/stock_pg.js');
var mongo = require('../db/stock_mongo.js');
var si = require('../stocks/stock_init.js');
var Processor = require('./Processor.js');
var log = require('../util/logger.js');
var util = require('util');

var logger = new log('processor:stockimport');

var startImportProcessor = function () {
    var db = new stockDB();

    var openMongo = function () {
	db.openPool();
	db.open();	
	db.queryStockList(getStockList);
    };

    var closeMongo = function () {
	mongo.close();
	db.closePool();

    };

    var getStockList = function (stockDatas){
	var stocks = [];
	var ps = null;

	for (var i = 0;i < stockDatas.length; i++)
	{
	    var code = stockDatas[i].stock_code;
	    var stock = new ProcessItem(new si(code, TaskProcessor.stock_init_20avg)), code);

	    stocks.push(stock);
	}
	db.close();	

	ps  = new Processor(stocks, 'Init20Processor');

	ps.start();
	ps.end();

	ps.on('end', closeMongo);
    };

    mongo.open(openMongo);
};

module.exports.startImportProcessor = startImportProcessor;
