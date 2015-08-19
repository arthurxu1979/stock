var events = require('events');
var http = require('http');
var url = require('url');
var fs = require('fs');
var util = require('util');
var csv = require('fast-csv');
var isThere = require('is-there');
var log = require('../util/logger.js');
var logger = new log('stocks:stockfile');

var StockFile = function(code, lastDate){
    events.EventEmitter.call(this);
    this.code = code;
    this.last = lastDate;
    
    if (typeof(lastDate) == 'undefined' || lastDate == null)
    {
	this.last = new Date('1900-1-1');	
    }
};

util.inherits(StockFile, events.EventEmitter);

StockFile.prototype.start = function() {
    var base = 'http://table.finance.yahoo.com/table.csv?';
    var market = this.code.substring(0,2);
    var stock_code = this.code.substring(2,8);
    var nowMonth = new Date().getMonth();
    var nowDay = new Date().getDate();
    var nowYear = new Date().getFullYear();
    var filename = this.code;
    var filePath = __dirname + '/../../data/' + filename + '.csv';
    var downloadedFile = filePath + this.last + 'downloaed';
    var self = this;

    if(market == 'SH')
    {
	base = base + 's=' + stock_code + '.SS';
    }

    if(market == 'SZ')
    {
	base = base + 's=' + stock_code + '.SZ';
    }

    var day = this.last.getDate();
    var month = this.last.getMonth();
    var year = this.last.getFullYear();

    base = base +'&a=' + month + '&b=' + day + '&c=' + year + '&d=' + nowMonth + '&e=' + nowDay + '&f=' + nowYear + '&g=d&ignore=.csv';
    
    var options = {
	host: url.parse(base).host,
	path: url.parse(base).path,
	method: 'GET'
    };

    var postDownload = function() {
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
	    .pipe(fs.createWriteStream(targetFile));
        logger.info('Transformed', self.code);
    };

    if (isThere(downloadedFile))
    {
	logger.info(downloadedFile);
	self.emit('end');
	return;
    }

    logger.debug('Downloaded URL:', base);
    
    var file = fs.createWriteStream(filePath);
    var req = http.request(options, function(res) {
	logger.info('Download response:', res.statusCode);
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
	    var fd = fs.openSync(downloadedFile, 'w');
	    fs.closeSync(fd);
	    logger.debug('Downloaded file:', filePath);
	    postDownload();
	    self.emit('end');
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

module.exports = StockFile;
