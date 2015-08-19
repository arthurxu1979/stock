var events = require('events');
var log = require('../util/logger.js');
var db = require('../db/stock_pg.js');
var builder = require('../module/moduleBuilder.js');
var repo = require('../module/moduleRepo.js');
var util = require('util');
var logger = new log('stock:module');

var StockModule = function(_code, _type) {
    events.EventEmitter(this);
    this.code = _code;
    this.moduleType = _type;    
};

util.inherits(StockModule, events.EventEmitter);

StockModule.prototype.start = function () {
    var self = this;
    var stockDB = new db();
    stockDB.open();

    var stockModuleCheck = function (stocks) {
	if(stocks)
	{
	    var stock_module = builder.buildModule(self.moduleType);
	    var stockValid = stock_module.validate(stocks);

	    if(stock_module && stockValid)
	    {
		logger.debug('Add to repo', self.code);
		repo.addToModuleRepo(self.code, self.moduleType);
	    }
	}

	stockDB.close();
	self.emit('end');
    };
    
    stockDB.queryOneStock(this.code, stockModuleCheck);
};

module.exports = StockModule;

