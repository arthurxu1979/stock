var events = require('events');
var log = require('../util/logger.js');
var csv = require('fast-csv');
var db = require('../db/stock_pg.js');
var mongo = require('../db/stock_mongo.js');
var util = require('util');
var fs = require('fs');
var isThere = require('is-there');

var logger = new log('stock:init');

var duration = 5;

var StockInit20 = function (code) {
    events.EventEmitter(this);
    this.code = code;
    this.lastDate = new Date("1900-1-1");
};

util.inherits(StockInit20, events.EventEmitter);

StockInit20.prototype.start = function () {
    var self = this;
    var stockDB = new db();
    var stock5Days = [];
    var stock20Avgs = [];
    var next_v = 10;

    var end = function() {
	self.emit('end');
    }

    var for20Avg = function(newValue) {
	// This is the method to
	// 1. push a new value into 20 average array
	// 2. pop the head one more than 20.
	// 3. Get the array average;
	stock20Avgs.push(newValue);
	
	if (stock20Avgs.length > 20){
	    stock20Avgs.shift();	    
	}

	var total = 0;

	stock20Avgs.forEach(function(value) {
	    total += value;
	});

	return total/stock20Avgs.length;
    };
    
    var getDistByValue = function(value) {
	var dist = 0;
	var v = value * value;
	if (v >= 1 && v < 4) {
	    dist = 1;
	}

	if (v >=4 && v < 9) {
	    dist = 2;
	}
	

	if (v >= 9 && v < 25) {
	    dist = 3;
	}

	if (v >=25 && v < 64) {
	    dist = 4;
	}

	if (v >=64 && v < 144) dist = 5;

	if (v >= 144) dist = 6;

	if (value < 0)
	{
	    dist = -dist;
	}

	return dist;
    };	        

    var getPriceByValue = function(value) {
	var p = value * value;
	var price = 0;
	if (p >= 0 && p < 9) {
	    price = 1;
	}

	if (p >= 9 && p < 100) {
	    price = 2;
	}

	if (p >= 100) {
	    price = 3;
	}

	if (value < 0)
	{
	    price = -price;
	}

	return price;
    };    

    var initStock5Days = function(stocks) {
	for(var i = 0;i < stocks.length - next_v; i++)
	{
	    var avg = 0;
	    if (stocks[i].volume <= 0)
	    {
		stocks[i].avg = avg;
	    } else {
		// Push daily average for total average
		avg = for20Avg((stocks[i].open + stocks[i].close)/2);
		stocks[i].avg =avg;
		
		if (stocks[i].stock_date > self.lastDate && i >= 5)
		{
		    var next_value = 0;
		    
		    if (i < stocks.length - next_v)
		    {
			next_value = 100 * (stocks[i + next_v].close - stocks[i].close) / stocks[i].close;
		    }

		    // Get prev avg value for 10, 20
		    var prev_10 = stock5Days.length - 10 > 0? stock5Days.length - 10: 0
		    var prev_20 = stock5Days.length - 20 > 0? stock5Days.length - 20: 0;

		    var pre_avg_10 = stocks[prev_10].avg;
		    var pre_avg_20 = stocks[prev_20].avg;

		    var pre_10 = 100 * (avg - pre_avg_10) / avg;
		    var pre_20 = 100 * (pre_avg_10 - pre_avg_20) / pre_avg_10;

		    var pre_v = getPriceByValue(pre_10 + pre_20);
		    
		    var stock5Day = {
			code: stocks[i].code,
			stock_date: stocks[i].stock_date,
			open: stocks[i].open,
			close: stocks[i].close,
			average: avg,
			pre_10: pre_avg_10,
			pre_20: pre_avg_20,
			pre_v: pre_v,
			next: next_value
		    };		

		    stock5Day.stocks = [];

		    for(var j = 5;j > 0; j--)
		    {
			var prevStock = stocks[i - j];

			var stockDay = {
			    date: prevStock.stock_date,			    
			    open: 100 * (prevStock.open - prevStock.avg)/prevStock.avg,
			    close: 100 * (prevStock.close - prevStock.avg)/prevStock.avg
			};

			stockDay.open_value = getDistByValue(stockDay.open);
			stockDay.close_value = getDistByValue(stockDay.close);
			
			stock5Day.stocks.push(stockDay);
		    }

		    stock5Days.push(stock5Day);
		}
	    }
	}	
    };

    var initStockData = function(stocks) {
	logger.info('Init Stock 20:', self.code, self.lastDate);
	if (stocks && stocks.length >=10)
	{
	    initStock5Days(stocks);	    

	    if(stock5Days.length <= 0)
	    {
		stockDB.close();
		end();
		return;
	    }


	    logger.debug('To insert stocks20 5-days result:', self.code, stock5Days.length);
	    for (var days5_i = 0;days5_i < stock5Days.length/1000;days5_i++)
	    {
		if (stock5Days.length > 1000 * (days5_i + 1))
		{
		    mongo.initStock20Days(stock5Days.slice(1000*days5_i,1000*days5_i+1000), self.code);
		} else {
		    mongo.initStock20Days(stock5Days.slice(1000*days5_i,1000*days5_i+1000), self.code, end);
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

    mongo.getLatestStock20(this.code, queryOneStock);
};

module.exports = StockInit20;
