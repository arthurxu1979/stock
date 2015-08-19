var events = require('events');
var log = require('../util/logger.js');
var csv = require('fast-csv');
var db = require('../db/stock_pg.js');
var mongo = require('../db/stock_mongo.js');
var builder = require('../analyze/analyzeBuilder.js');
var util = require('util');
var fs = require('fs');
var isThere = require('is-there');

var logger = new log('stock:init');

var duration = 5;

var StockInit = function (code, processor) {
    events.EventEmitter(this);
    this.code = code;
    this.processor = processor;
    this.lastDate = new Date("1900-1-1");
    this.analyze = builder.buildAnalyze(processor);
};

util.inherits(StockInit, events.EventEmitter);

StockInit.prototype.start = function () {
    var self = this;
    var stockDB = new db();
    var stock5Days = [];

    var end = function() {
	self.emit('end');
    }

    var initStockData = function(stocks) {
	logger.info('Init Stock:', self.code, self.lastDate);
	if (stocks && stocks.length >=10)
	{
	    var stockDays = self.analyze.getList(stocks);
	    
	    for(var i = 0;i< stockDays.length - duration;i++)
	    {
		if (stockDays[i].stock_date > self.lastDate)
		{
		    stock5Days.push(stockDays[i]);
		}
	    }

	    if(stock5Days.length <= 0)
	    {
		stockDB.close();
		end();
		return;
	    }

	    logger.debug('To insert stocks result:', self.code, self.processor,stock5Days.length);
	    for (var days5_i = 0;days5_i < stock5Days.length/1000;days5_i++)
	    {
		if (stock5Days.length > 1000 * (days5_i + 1))
		{
		    mongo.initStockCollection(stock5Days.slice(1000*days5_i,1000*days5_i+1000), self.code, self.analyze.getCollection());
		} else {
		    mongo.initStockCollection(stock5Days.slice(1000*days5_i,1000*days5_i+1000), self.code, self.analyze.getCollection(), end);
		}		    
	    }
	} else {
	    stockDB.close();
	    end();
	}
    };

    var queryOneStock = function(stock) {
	if(stock) self.lastDate = stock.last_date;
	
	stockDB.open();
	stockDB.queryOneStock(self.code, initStockData);
    };

    if (this.analyze != null)
    {	
	mongo.getLatestStock(this.code, this.analyze.getCollection(), queryOneStock);
    } else {
	logger.info('Invalid operation', this.code, this.processor);
	this.emit('end');
    }
};

module.exports = StockInit;
