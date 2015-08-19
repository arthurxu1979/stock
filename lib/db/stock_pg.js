var pg = require('pg');
var pg_copy = require('pg-copy-streams').from;
var util = require('util');
var conStr = "tcp://postgres:postgres@localhost/stock";
var logger = require('bragi');
var stock_log = 'lib:stock_pg';

logger.transports.get('console').property('showMeta', false);

var dbClient = new pg.Client(conStr);

var StockDB = function() {
    this.client = dbClient;
};

StockDB.prototype.openPool = function () {
    dbClient.connect();

};

StockDB.prototype.closePool = function () {
    dbClient.end();
};

StockDB.prototype.open = function() {
};

StockDB.prototype.close = function() {
};

StockDB.prototype.removeDuplicate = function(callback) {
    this.client.query(
	"SELECT fn_remove_duplicate()",
	[],
	function(err, results) {
	    if (err)
	    {
		logger.log(stock_log, 'Remove duplicate failed', err.message);
	    }

	    if (callback) callback();
	});	
};

StockDB.prototype.copy = function(csvStream, callback) {

    var stream = this.client.query(pg_copy('COPY stock_his(code, stock_date, open, close, high,low,volume) FROM STDIN (FORMAT csv, HEADER true)'))
	.on('error', function(err) {
	    logger.log(stock_log, 'Copy failed:', err.message);
	    callback();
	});
    
    csvStream.pipe(stream).on('finish', callback);

};

StockDB.prototype.insertHis = function(stockHisList, callbackForEnd) {
    var insertedCount = 0;
    var self = this;
    var lastDate = new Date('1900-1-1');
    var code = null;
    for (var i = 0; i < stockHisList.length; i++)
    {
	var stockHis = stockHisList[i];

	if (lastDate < stockHis.date)
	{
	    lastDate = stockHis.date;
	}

	code = stockHis.code;

	this.client.query(
	'insert into stock_his (code, stock_date, open, close, high, low, change, volume, money, traded_market_value, marketed_value, turn_over) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
	[stockHis.code,stockHis.date,stockHis.open,stockHis.high,stockHis.low,stockHis.close,stockHis.change,stockHis.volume,stockHis.money,stockHis.traded_market_value,stockHis.market_value,stockHis.turnover],
	function(err, results) {
	    if (err)
	    {
		console.log(JSON.stringify(stockHis));		
		
		console.log('Insert ' + stockHis.code + '(' + stockHis.date + '):' + err.message);

		callbackForEnd();		
	    }

	    insertedCount += results.rowCount;

	    if (insertedCount >= stockHisList.length)
	    {
		console.log(stockHis.code + ' inserted with ' + insertedCount + ' row inserted');

		self.client.query(
		    'update stock_name set lastDate=$1 where code=$2',
		    [lastDate, code],
		    function(err, results) {
			callbackForEnd();
		    });
	    }
	});
    }
};

StockDB.prototype.audit = function(task_id, code, operation, status, callback) {
    this.client.query(
	'insert into audit (auit_id, code, operation, audit_time, status) values($1, $2, $3, $4, $5)',
	[task_id, code, operation, new Date(), status],
	function (err, results) {
	    if (err) logger.info('Audit failed', task.id, status);

	    logger.debug('Audited', task.id, status);
	    if (callback) callback();
	});
};

StockDB.prototype.insertTrans = function(report, callbackForEnd) {
    var insertedCount = 0;
    var self = this;
    
    this.client.query(
	'insert into stock_trans (code, stock_date, hit, h_inc, h_normal, h_dec, l_inc, l_normal, l_dec, inc, normal, dec, type, module) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
	[report.code, report.stock_date, report.hit, report.h_inc, report.h_normal, report.h_dec, report.l_inc, report.l_normal, report.l_dec, report.inc, report.normal, report.dec, report.type, report.module],
	function(err, results) {
	    if (err)
	    {
		
		console.log('Insert err ' + err.message);

		callbackForEnd(report.code);
		return;
	    }

	    callbackForEnd(report.code);	    
	});
};

StockDB.prototype.updateStock5Days = function(code, last, callback) {
    this.client.query(
	'update stock_name set days_5=true, days5_last=$2 where code=$1',
	[code, last],
	function(err, results) {
	    if (err)
	    {
		logger.log(stock_log, 'Update days_5 failed:' + err.message);
	    } else {

		logger.log(stock_log, 'Update days_5 for:' + code);
	    }

	    if (callback) callback();
	});
};

StockDB.prototype.queryStockInfo = function(code, callback) {
    this.client.query(
	'SELECT code as stock_code, stock_date FROM stock_his WHERE code=$1 order by stock_date DESC limit 1',
	[code],
	function(err, results) {
	    if (err)
	    {
		logger.log(stock_log, 'Stock not found', code, err.message);
	    }

	    if (callback) callback(results.rows);
	});
};

StockDB.prototype.queryStockList = function(dataCallback) {
    this.client.query(
	'select code as stock_code, last_date from fn_get_stock_latest()',
	function (err, results) {
	    if (err)
	    {
		console.log('Get stockname failed ' + err.message);
		return;
	    }

	    if (dataCallback)
	    {
		dataCallback(results.rows);
	    }
	});    
};

StockDB.prototype.queryStockListForMP = function(dataCallback) {
    this.client.query(
	'select trim(code) as stock_code from stock_name where ifmonitor=true',
	function (err, results) {
	    if (err)
	    {
		console.log('Get stockname failed ' + err.message);
		return;
	    }

	    if (dataCallback)
	    {
		dataCallback(results.rows);
	    }
	});    
};

StockDB.prototype.queryOneStock = function(stockCode, dataCallback) {
    this.client.query(
	'select stock_date, open, close,volume from stock_his where code=$1 order by stock_date asc',
	[stockCode],
	function (err, results) {
	    if (err)
	    {
		logger.log(stock_log, 'Get Stock ' + stockCode + ' failed');
		dataCallback();
		return;
	    }

	    var stocks = [];
	    for(var i = 0;i < results.rowCount; i++)
	    {
		var eachRow = {
		    code: stockCode,
		    stock_date: results.rows[i].stock_date,
		    open: results.rows[i].open,
		    close: results.rows[i].close,
		    volume: results.rows[i].volume
		};
		stocks.push(eachRow);
	    }

	    if (dataCallback)
	    {
		dataCallback(stocks);
	    }
	});  
};

module.exports = StockDB;
