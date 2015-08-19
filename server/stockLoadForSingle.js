var engine = require('../lib/flow/flow_engine.js');
var db = require('../lib/db/stock_pg.js');
var mongo = require('../lib/db/stock_mongo.js');
var stockFlow = require('../lib/stocks/stock_flow.js');
var FlowOperation = require('../lib/core/status.js').FlowOperation;

var stockDB = new db();
var stock = {
    stock_code: 'SH601628'
};

var startStock = function() {

    stockDB.openPool();

    engine.startEngine(FlowOperation.flow_import, function() {
	var sf = new stockFlow(stock, FlowOperation.flow_import);
	sf.on('end', startInit);

	sf.start();
    });
};

var startInit = function () {
    var si = new stockFlow(stock, FlowOperation.flow_init);
    si.on('end', endStock);
    si.start();
};

var endStock = function() {
    engine.endEngine(function() {
	stockDB.closePool();
	mongo.close();	
    });
};
console.log('Begin Stock Refresh');
mongo.open(startStock);

