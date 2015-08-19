var events = require('events');
var http = require('http');
var url = require('url');
var fs = require('fs');
var util = require('util');
var csv = require('fast-csv');
var isThere = require('is-there');
var db = require('../db/stock_pg.js');
var log = require('../util/logger.js');
var logger = new log('stocks:stockfile');

var StockFile = function(code){
    events.EventEmitter.call(this);
    this.code = code;
    this.last = new Date('1900-1-1');
};

util.inherits(StockFile, events.EventEmitter);

StockFile.prototype.end = function() {
    this.emit('end');
};

StockFile.prototype.start = function() {
    var base = 'http://table.finance.yahoo.com/table.csv?';
    var market = this.code.substring(0,2);
    var stock_code = this.code.substring(2,8);
    var nowMonth = new Date().getMonth();
    var nowDay = new Date().getDate();
    var nowYear = new Date().getFullYear();
    var filename = this.code;
    var filePath = __dirname + '/../../data/' + filename + '.csv';
    var self = this;

    var stockDB = new db();

    var download = function(stocks) {
	stockDB.close();
	if (stocks.length > 0)
	{
	    self.last = stocks[0].stock_date;
	}
	    
	if(market == 'SH')
	{
	    base = base + 's=' + stock_code + '.SS';
	}

	if(market == 'SZ')
	{
	    base = base + 's=' + stock_code + '.SZ';
	}

	var day = self.last.getDate();
	var month = self.last.getMonth();
	var year = self.last.getFullYear();

	base = base +'&a=' + month + '&b=' + day + '&c=' + year + '&d=' + nowMonth + '&e=' + nowDay + '&f=' + nowYear + '&g=d&ignore=.csv';
	
	var options = {
	    host: url.parse(base).host,
	    path: url.parse(base).path,
	    method: 'GET'
	};
	logger.debug('Downloaded URL:', base);
	
	var file = fs.createWriteStream(filePath);
	var req = http.request(options, function(res) {
	    logger.info('Download response:',self.code, res.statusCode);
	    if (res.statusCode != '200')
	    {
		file.end();
		self.emit('fail');
		return;
	    }
	    
	    res.on('data', function(chunk) {
		file.write(chunk);
	    }).on('end', function() {
		file.end();
		logger.debug('Downloaded file:', filePath);
		postDownload(function() {
		    logger.info('Download file transformed:', self.code);
		    self.end();
		});
	    });	
	});

	req.on('socket', function (socket) {
	    socket.setTimeout(300000);
	    socket.on('timeout', function() {
		file.end();
		logger.info(base + ' request timeout');
		req.abort();
		self.emit('fail');
	    });
	});
	
	req.on('error', function(err) {
	    file.end();
	    self.emit('fail');
	    logger.info(filePath + ' downloaded fail ' + err.message);
	});

	req.end();	    	
    };

    var postDownload = function(callback) {
	var sourceFile = __dirname + '/../../data/' + filename + '.csv';
	var targetFile = __dirname + '/../../data/transform/' + filename + '.csv';

	csv
	    .fromPath(sourceFile, {headers: true})
	    .transform(function(obj){
		return {
		    code: self.code,
		    stock_date: obj.Date,
		    open: obj.Open,
		    close: obj.Close,
		    high: obj.High,
		    low: obj.Low,
		    volume: obj.Volume
		};
	    })
	    .on('error', function(err) {
		logger.info('tranform failed', self.code, err.message);
	    })
	    .pipe(csv.createWriteStream({headers: true}))
	    .pipe(fs.createWriteStream(targetFile))
	    .on('finish', callback);
    };

    stockDB.open();
    stockDB.queryStockInfo(this.code, download);    
};

module.exports = StockFile;
