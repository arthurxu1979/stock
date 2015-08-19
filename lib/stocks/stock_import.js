var events = require('events');
var log = require('../util/logger.js');
var csv = require('fast-csv');
var db = require('../db/stock_pg.js');
var util = require('util');
var fs = require('fs');
var isThere = require('is-there');

var logger = new log('stock:import');

var StockImport = function (code) {
    events.EventEmitter.call(this);
    this.code = code;
};

util.inherits(StockImport, events.EventEmitter);

StockImport.prototype.start = function () {
    var self = this;
    var stockDB = new db();
    var filename = __dirname + '/../../data/transform/' + this.code + '.csv';
    if (!isThere(filename))
    {
	logger.info('File not exists', filename);
	this.emit('end');
	return;
    }
    
    var endCopy = function() {
	logger.info('File imported', self.code);
	stockDB.close();
	self.emit('end');
    };

    logger.info('Import File:', filename);
    var fileStream = fs.createReadStream(filename);

    stockDB.open();
    stockDB.copy(fileStream, endCopy);
};

module.exports = StockImport;
