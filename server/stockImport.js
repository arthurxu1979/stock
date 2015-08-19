var engine = require('../lib/flow/flow_engine.js');
var db = require('../lib/db/stock_pg.js');
var mongo = require('../lib/db/stock_mongo.js');
var flowProcessor = require('../lib/process/flowProcessor.js');
var FlowOperation = require('../lib/core/status.js').FlowOperation;


var stockDB = new db();
var startStock = function() {
    var beginDate = new Date();

    stockDB.openPool();

    engine.startEngine(FlowOperation.flow_import, function() {
	flowProcessor.startImportProcessor(function() {
	    engine.endEngine(function() {
		console.log('End engine, begin to clean up duplicate)');
		stockDB.removeDuplicate(function() {
		    stockDB.closePool();
		    mongo.close();
		    console.log('Import End');
		    console.log(new Date().getTime() - beginDate.getTime());
		});
	    });
	});
    });
};
console.log('Begin Stock Refresh');
mongo.open(startStock);

