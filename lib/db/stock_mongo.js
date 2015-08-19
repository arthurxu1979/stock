var MongoClient = require('mongodb').MongoClient;
var util = require('util');
var url = 'mongodb://localhost:27017/stocks';
var logger = require('bragi');
var stock_log = 'lib:stock_mongo';
var db = null;
var col = null;
var col_trans = null;
var col_results = null;
var col_flow = null;
var col_audit = null;

logger.transports.get('console').property('showMeta', false); 

var openMongo = function(callback) {
    if (db == null)
    {
	logger.log(stock_log, 'Openning Mongo');
	MongoClient.connect(url, function(err, database) {
	    if (err) throw err;
	    db = database;
	    logger.log(stock_log, 'Mongo open');
	    if(callback)
	    {
		callback();
	    }
	});
    }
};

var initStockCollection = function(stock5Days, stockCode, collection, callback) {
    var col_init = db.collection(collection);

    if (col_init != null)
    {
	col_init.insertMany(stock5Days, function(err, result) {
	    if (err)
	    {
		logger.log(stock_log, 'Insert Error:', err.message);
	
	    } else {
		logger.log(stock_log, 'Inserted stock days to:', stockCode, collection,stock5Days.length, result.insertedCount);
	    }

	    if (callback) callback();
	
	});
    } 
};

var getOneStock = function(_code, collection, callback) {
    var col_get = db.collection(collection);

    col_get.find({code:_code}).toArray(function(err, stocks) {
	if (err) logger.log(stock_log, 'Get one stock error', err.message);
	if (callback) callback(stocks);
    });
};

var getLatestStock = function(stock_code, collection, callback) {
    var col_get = db.collection(collection);

    col_get.aggregate([
	{$match: {code: stock_code}},
	{$group: {_id:"$code", last_date: {$max: "$stock_date"}}}
    ]).toArray( function(err, result) {
	if (err)
	{
	    logger.log(stock_log, ' query mongo fail', err.message);
	} else {
	    
	    logger.log(stock_log, 'get stock last date', result);
	}
	
	if (callback) callback(result[0]);
		
    });
};

var closeMongo = function() {
    if (db != null)
    {
	logger.log(stock_log,' Mongo Close');
	db.close();
    }
    db = null;
};

var mapReducerCollection = function(map, reduce, stock, collection, callback) {
    var col_mp = db.collection(collection);

    col_mp.mapReduce(map, reduce,
		  {out: {replace:'tempCollection'},
		   scope: {stock: stock},
		   verbose: true},
		  function (err, collection, stats) {
		      if (err) logger.log(stock_log, 'MP Error', err.message);

		      logger.log(stock_log, 'Stats', stats);
		      collection.find().toArray(function (err, results) {
			  if (callback) callback(results);
		      });
		  });
};

var mapReducerCollectionAll = function(map, reduce, stocks, collection, callback) {
    var col_mp = db.collection(collection);

    col_mp.mapReduce(map, reduce,
		  {out: {replace:'tempCollection'},
		   scope: {stockList: stocks},
		   verbose: true},
		  function (err, collection, stats) {
		      if (err) logger.log(stock_log, 'MP Error', err.message);

		      logger.log(stock_log, 'Stats', stats);
		      collection.find().toArray(function (err, results) {
			  if (callback) callback(results);
		      });
		  });
};

var getFlows = function(_filterState, _operation, callback) {
    if (col_flow == null) col_flow = db.collection('flows');

    col_flow.find({state:_filterState,operation:_operation}).toArray(function(err, flows) {
	if (err)
	{
	    logger.log(stock_log, 'Get Flow Failed', err.message);
	}

	if(callback) callback(flows);
    });
};

var insertFlow = function(_flow, callback) {
    if (col_flow == null) col_flow = db.collection('flows');

    col_flow.insertOne(_flow, function(err, result) {
	if(err)
	{
	    logger.log(stock_log, 'Insert Flow fail', err.message);
	} else {
	    col_flow.findOne({code: _flow.code, operation:_flow.operation, state:_flow.state}, function(err, item) {
		if(!err && callback)
		{
		    callback(item);
		}
	    });
	}
    });
    
};

var updateFlow = function(flow, callback) {
    if (col_flow == null) col_flow = db.collection('flows');

    col_flow.updateOne({_id:flow._id},{$set: flow}, {upsert:false},
		       function (err, results) {
			   if (err) logger.log(stock_log, 'Upsert flow', err.message, flow.id);

			   if (callback) callback();
		    });
};

module.exports.insertFlow = insertFlow;
module.exports.getFlows = getFlows;
module.exports.updateFlow = updateFlow;
module.exports.mapReducerCollection = mapReducerCollection;
module.exports.mapReducerCollectionAll = mapReducerCollectionAll;
module.exports.open = openMongo;
module.exports.close = closeMongo;
module.exports.initStockCollection = initStockCollection;
module.exports.getOneStock = getOneStock;
module.exports.getLatestStock = getLatestStock;

