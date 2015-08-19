var Analyze_5 = require('./stock_5.js');
var Analyze_20 = require('./stock_20avg.js');
var Analyze_15 = require('./stock_15.js');
var tp = require('../core/status.js').TaskProcessor;

var buildAnalyze = function(processor) {
    var analyze = null;
    switch(processor)
    {
	case tp.stock_init_5:
	case tp.stock_analyze_5:
	analyze = new Analyze_5();	
	break;
	case tp.stock_init_20avg:
	case tp.stock_analyze_20:
	analyze = new Analyze_20();
	break;
	case tp.stock_init_15:
	case tp.stock_analyze_15:
	analyze = new Analyze_15();
	break;
    }
    
    return analyze;
};

module.exports.buildAnalyze = buildAnalyze;
