var Processor = require('./Processor.js');
var stockDB = require('../db/stock_pg.js');
var mongo = require('../db/stock_mongo.js');
var builder = require('../analyze/analyzeBuilder.js');
var analyzeRepo = require('../stocks/analyze_repo.js');
var ProcessItem = require('../core/ProcessItem.js');
var log = require('../util/logger.js');
var limitation = 120;

var logger = new log('processor:analyze');

var initProcessor = function() {
    var db = new stockDB();
    db.openPool();
    mongo.open();
};

var endProcessor = function() {
    var db = new stockDB();
    db.closePool();
    mongo.close();
};

var startAnalyzeProcessor = function(_processor, _analyzeStocks, endCallback) {
    var analyzeStocks = _analyzeStocks;
    var processor = _processor;
    var callback = endCallback;
    var db = new stockDB();
    
    var mpStockList = function(_stocks) {
	var initStocks = [];
	if (analyzeStocks) {
	    analyzeStocks.forEach(function(_aStock) {
		if(initStocks.length <= limitation) {
		    initStocks.push(_aStock);
		}
	    });
	}

	_stocks.forEach(function(_stock) {
	    var exists = false;
	    if (initStocks.length <= limitation) {
		initStocks.forEach(function(_is) {
		    if(_is.stock_code == _stock.stock_code) {
			exists = true;
		    }
		});

		if(!exists)
		{		
		    _stock.module = 'Monitor';
		    initStocks.push(_stock);
		}
	    }
	});
	
	stockLength = initStocks.length;
	startProcessor(processor, initStocks, callback);
    };
    
    db.queryStockListForMP(mpStockList);    
};

var startProcessor = function(_processor, _analyzeStocks, endCallback) {
    var processor = _processor;
    var beginDate = new Date();
    var db = new stockDB();
    var stockLength = 0;
    var stockList = [];
    var stockLoaded = 0;
    var stockResult = new Object();
    var analyze = builder.buildAnalyze(processor);
    var callback = endCallback;

    var endPS = function() {
	var result = new analyzeRepo(null, processor,stockList);
	var results = result.result();
	var insertedResult = 0;
	results.forEach(function(_result) {
	    stockResult[_result.code].h_normal += _result.h_normal;
	    stockResult[_result.code].h_inc += _result.h_inc;
	    stockResult[_result.code].h_dec += _result.h_dec;
	    stockResult[_result.code].l_inc += _result.l_inc;
	    stockResult[_result.code].l_dec += _result.l_dec;
	    stockResult[_result.code].hit += _result.h_inc+_result.h_dec+_result.h_normal+_result.l_inc+_result.l_dec;
	});

	var endProcess = function() {
	    if (insertedResult >= stockList.length)
	    {
		var duration = (new Date().getTime() - beginDate.getTime());
		if(callback) callback(duration);
	    }
	};

	stockList.forEach(function(_stock) {
	    var result = stockResult[_stock.code];
	    if (result && result.hit > 0)
	    {
		result.inc = 100 * (result.h_inc + result.l_inc) / result.hit;
		result.dec = 100 * (result.h_dec + result.l_dec) / result.hit;
		result.normal = 100 * result.h_normal / result.hit;
		db.insertTrans(result, function() {
		    insertedResult++;
		    endProcess();
		});
	    } else {
		insertedResult++;
		endProcess();
	    }	    
	});
	result.reset();
    };

    var startPS = function() {
	var items = [];
	var repo_ps = null;
	var i = 0;
	
	db.queryStockList(function(_rows) {
	    _rows.forEach(function(_row) {
		if (i>=0)
		{
		    var repoItem = new ProcessItem(new analyzeRepo(_row.stock_code, processor, stockList),_row.stock_code);
		    repoItem.processor = processor;
		    items.push(repoItem);
		    i++;
		}


	    });

	    repo_ps = new Processor(items, processor);
	    repo_ps.threads = 10;
	    repo_ps.start();
	    repo_ps.on('end', endPS);
	    repo_ps.end();
	});	
    };

    var initStock = function(_stock) {

	db.queryOneStock(_stock.stock_code, function(_stocks) {	    
	    var stockDay = analyze.getMPList(_stocks);

	    if(stockDay)
	    {
		stockList.push(stockDay);
		var report = {
		    code:stockDay.code,
		    stock_date:stockDay.stock_date,
		    hit:0,
		    h_inc:0,
		    h_normal:0,
		    h_dec:0,
		    l_inc:0,
		    l_dec:0,
		    type:processor,
		    module: _stock.module
		};

		stockResult[stockDay.code] = report;		
	    }
	    
	    stockLoaded++;

	    if(stockLoaded >= stockLength)
	    {
		logger.debug('Stock Result:', stockResult, stockList.length);
		startPS();
	    }
	});	    
    };

    stockLength = _analyzeStocks.length;
    _analyzeStocks.forEach(initStock);
};

module.exports.startAnalyzeProcessor = startAnalyzeProcessor;
module.exports.startProcessor = startProcessor;
module.exports.initProcessor = initProcessor;
module.exports.endProcessor = endProcessor;
