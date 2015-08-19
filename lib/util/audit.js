var db = require('../db/stock_pg.js');

var audit = function(item, status) {
/*    var auditDB = new db();
    auditDB.open();
    auditDB.audit(item.id, item.name, item.operation, status, function() {
	auditDB.close();
    });    */
};

module.exports.audit = audit;
