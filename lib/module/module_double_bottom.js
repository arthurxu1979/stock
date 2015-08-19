var log = require('../util/logger.js');
var logger = new log('double_bottom');

var double_bottom = function() {
    this.duration = 30;
};

double_bottom.prototype.validate = function(stocks) {
    var ifValid = false;
    var btmIndex_1 = stocks.length;
    var btmIndex_2 = stocks.length;
    var middle_index = stocks.length;
    var self = this;

    var getBottom = function(_stocks, begin, end) {
	var index = begin
	var btm = _stocks[begin];
	for (var i = begin; i < end && i < _stocks.length; i++)
	{
	    if (_stocks[i].close <= btm.close)
	    {
		btm = _stocks[i];
		index = i;	
	    }
	}

	return index;
    };

    var getMiddleHigh = function(_stocks, index1, index2) {
	var begin = index1 > index2 ? index2:index1;
	var end = index1 > index2 ? index1:index2;
	var middleIndex = begin;
	var middle = _stocks[middleIndex];
	
	for (var i = begin; i <= end; i++)
	{
	    if(_stocks[i].close >= middle.close)
	    {
		middle = _stocks[i];
		middleIndex = i;
	    }	 
	}

	return middleIndex;
    };

    var validateResult = function(_stocks, index1, index2, middle)
    {
	var btm_begin = _stocks[_stocks.length - self.duration];
	var btm_delta = 100 * (_stocks[index2].close - _stocks[index1].close) / _stocks[index1].close;
	var mid_delta = 100 * (_stocks[middle].close - _stocks[index1].close) / _stocks[index1].close;
	var low_delta = 100 * (_stocks[index1].close - btm_begin.close) / btm_begin.close;
	var valid = true;

	if (low_delta > -15)
	{
	    valid = false;
	}

	if (btm_delta >= 2)
	{
	    valid = false;
	}

	if (mid_delta <= 5)
	{
	    valid = false;
	}

	return valid;	
    }
    
    if (stocks && stocks.length>self.duration)
    {
	var lows = [];
	for (var i = stocks.length - self.duration;i < stocks.length; i = i+5)
	{
	    lows.push(getBottom(stocks,i, i+5));
	}
	
	btmIndex_1 = lows[0];

	lows.forEach(function(low){
	    if(stocks[low].close < stocks[btmIndex_1].close)
	    {
		btmIndex_1 = low;
	    }
	});

	btmIndex_2 = lows[0];

	lows.forEach(function(low){
	    if(stocks[low].close < stocks[btmIndex_2].close)
	    {
		if (low != btmIndex_1)
		{
		    btmIndex_2 = low;
		}
	    }
	});

	middleIndex = getMiddleHigh(stocks, btmIndex_1, btmIndex_2);

	ifValid = validateResult(stocks, btmIndex_1, btmIndex_2, middleIndex);	
    }
    
    return ifValid;
    
};

module.exports = double_bottom;
