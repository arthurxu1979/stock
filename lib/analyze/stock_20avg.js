
var Analyze_20avg = function() {
    this.stock20Avgs = [];
    this.next_day = 5;
    this.duration = 5;
};

Analyze_20avg.prototype.for20Avg = function(newValue) {
    // This is the method to
    // 1. push a new value into 20 average array
    // 2. pop the head one more than 20.
    // 3. Get the array average;
    this.stock20Avgs.push(newValue);
    
    if (this.stock20Avgs.length > 20){
	this.stock20Avgs.shift();	    
    }

    var total = 0;

    this.stock20Avgs.forEach(function(value) {
	total += value;
    });

    return total/this.stock20Avgs.length;    
};

Analyze_20avg.prototype.getDistByValue = function(value) {
    var dist = 0;
    var v = value * value;
    if (v >= 1 && v < 4) {
	dist = 1;
    }

    if (v >=4 && v < 9) {
	dist = 2;
    }
    

    if (v >= 9 && v < 25) {
	dist = 3;
    }

    if (v >=25 && v < 64) {
	dist = 4;
    }

    if (v >=64 && v < 144) dist = 5;

    if (v >= 144) dist = 6;

    if (value < 0)
    {
	dist = -dist;
    }

    return dist;    
};

Analyze_20avg.prototype.getPriceByValue = function(value) {
    var p = value * value;
    var price = 0;
    if (p >= 0 && p < 9) {
	price = 1;
    }

    if (p >= 9 && p < 100) {
	price = 2;
    }

    if (p >= 100) {
	price = 3;
    }

    if (value < 0)
    {
	price = -price;
    }

    return price;    
};

Analyze_20avg.prototype.getAvgList = function (stocks, start) {
    var stock5Days = [];
    for(var i = 0;i < stocks.length; i++)
    {
	var avg = 0;
	if (stocks[i].volume <= 0)
	{
	    stocks[i].avg = avg;
	} else {
	    // Push daily average for total average
	    avg = this.for20Avg((stocks[i].open + stocks[i].close)/2);
	    stocks[i].avg =avg;

	    if (i >= this.duration && i >= start)
	    {
		var next_value = 0;
		
		if (i < stocks.length - this.next_day)
		{
		    next_value = 100 * (stocks[i + this.next_day].close - stocks[i].close) / stocks[i].close;
		}

		// Get prev avg value for 10, 20
		var prev_10 = i - 10 > 0? i - 10: 0
		var prev_20 = i - 20 > 0? i - 20: 0;

		var pre_avg_10 = stocks[prev_10].avg;
		var pre_avg_20 = stocks[prev_20].avg;

		var pre_10 = 100 * (avg - pre_avg_10) / avg;
		var pre_20 = 100 * (pre_avg_10 - pre_avg_20) / pre_avg_10;

		var pre_v = this.getPriceByValue(pre_10 + pre_20);
		
		var stock5Day = {
		    code: stocks[i].code,
		    stock_date: stocks[i].stock_date,
		    open: stocks[i].open,
		    close: stocks[i].close,
		    average: avg,
		    pre_10: pre_avg_10,
		    pre_20: pre_avg_20,
		    pre_v: pre_v,
		    next: next_value
		};		

		stock5Day.stocks = [];

		for(var j = this.duration;j > 0; j--)
		{
		    var prevStock = stocks[i - j];

		    var stockDay = {
			date: prevStock.stock_date,			    
			open: 100 * (prevStock.open - prevStock.avg)/prevStock.avg,
			close: 100 * (prevStock.close - prevStock.avg)/prevStock.avg
		    };

		    stockDay.open_value = this.getDistByValue(stockDay.open);
		    stockDay.close_value = this.getDistByValue(stockDay.close);
		    
		    stock5Day.stocks.push(stockDay);
		}

		stock5Days.push(stock5Day);
	    }
	}
    }

    return stock5Days;
};

Analyze_20avg.prototype.getList = function (stocks) {
    return this.getAvgList(stocks, 0);
};

Analyze_20avg.prototype.getMPList = function (stocks) {
    var mpStocks = this.getAvgList(stocks, stocks.length - this.duration);

    if (mpStocks.length >= this.duration)
    {	
	return mpStocks[mpStocks.length - 1];
    }

    return null;
};

Analyze_20avg.prototype.getCollection = function () {
    return 'stocks_20';
};

Analyze_20avg.prototype.mapAll = function(stockList, stockDays) {
    var results = [];
    var max_dis = 4;

    for (var j = 0;j < stockList.length;j++)
    {
	delta = 0;
	var stocks = stockList[j].stocks;
	var pre_v = stockList[j].pre_v;
	var stockKey = {
	    code: stockList[j].code,
	    next: 0
	};
	var stockResult = {
	    code: stockList[j].code,
	    h_normal:0,
	    l_inc:0,
	    h_inc:0,
	    l_dec:0,
	    h_dec:0
	};

	stockDays.forEach(function(_stockDay) {
	    var delta = 0;
	    if (pre_v == _stockDay.pre_v)
	    {
		for (var i = 0;i < 5; i++)
		{
		    if (delta <= max_dis)
		    {
			var dist_open = _stockDay.stocks[i].open_value - stocks[i].open_value;
			var dist_close = _stockDay.stocks[i].close_value - stocks[i].close_value;

			delta += abs(dist_open) + abs(dist_close);
		    }
		}

		if (delta <= max_dis)
		{
		    var next = _stockDay.next;
		    if (next > 3 && next < 10) {
			stockResult.l_inc++;
		    }

		    if (next < -3 && next > -10) {
			stockResult.l_dec++;
		    }

		    if (next >= 10) {
			stockResult.h_inc++;
		    }

		    if (next <= -10) {
			stockResult.h_dec++
		    }

		    if (next>=-3 && next<=3)
		    {
			stockResult.h_normal++;
		    }
		}
	    }
	});

	results.push(stockResult);
    }

    return results;
};

module.exports = Analyze_20avg;
