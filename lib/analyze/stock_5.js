var Analyze_5 = function () {
    this.next_day = 5;
    this.duration = 5;
};

Analyze_5.prototype.getList = function (stocks) {

    var stock5Days = [];

    for(var i = this.duration - 1;i < stocks.length; i++)
    {
	var next_value = 0;
	
	if (i < stocks.length - this.next_day)
	{
	    next_value = 100 * (stocks[i + this.next_day].close - stocks[i].close) / stocks[i].close;
	}
	
	var stock5Day = {
	    code: stocks[i].code,
	    stock_date: stocks[i].stock_date,
	    next: next_value
	};

	var basePrice = stocks[i - this.duration + 1].open;
	var baseVolume = stocks[i - this.duration + 1].volume;

	if (baseVolume >0)
	{
	    stock5Day.stocks = [];

	    for(var j = this.duration - 1;j >= 0; j--)
	    {
		var stockDay = {
		    date: stocks[i-j].stock_date,
		    open: 100 * (stocks[i-j].open - basePrice)/basePrice,
		    close: 100 * (stocks[i-j].close - basePrice)/basePrice,
		    volume: 100 * (stocks[i-j].volume - baseVolume)/baseVolume
		};
		
		stock5Day.stocks.push(stockDay);
	    }

	    stock5Days.push(stock5Day);
	}
    }

    return stock5Days;
};

Analyze_5.prototype.getMPList = function(stocks) {
    var stock5Day = null;
    
    if (stocks.length <= 0)
    {	
	return stock5Day;

    }
    
    var baseIndex = stocks.length - this.duration > 0?stocks.length - this.duration:0;
    var basePrice = stocks[baseIndex].open;
    var baseVolume = stocks[baseIndex].volume;
    

    if (baseVolume <= 0 || basePrice <= 0 || baseIndex > (stocks.length - this.duration))
    {
	console.log('Invalid stock');
	stock5Day = null;
    } else {
	stock5Day = {
	    code: stocks[baseIndex].code,
	    stock_date: stocks[stocks.length - 1].stock_date,
	    stocks: []
	};
	
	for (var i = baseIndex; i <stocks.length; i++)
	{
    	    var stockDay = {
		date: stocks[i].stock_date,
		open: 100 * (stocks[i].open - basePrice)/basePrice,
		close: 100 * (stocks[i].close - basePrice)/basePrice,
		volume: 100 * (stocks[i].volume - baseVolume)/baseVolume
	    };
	    stock5Day.stocks.push(stockDay);		
	}
    }

    return stock5Day;

};

Analyze_5.prototype.getCollection = function () {
    return 'stocks';
};

Analyze_5.prototype.mapAll = function(stockList, stockDays) {
    var results = [];
    var max_dist = 25;
    
    for(var i = 0;i < stockList.length; i++)
    {
	var stocks = stockList[i].stocks;
	var stockResult = {
	    code: stockList[i].code,
	    h_normal:0,
	    l_inc:0,	    
	    h_inc:0,
	    l_dec:0,
	    h_dec:0
	};

	stockDays.forEach(function (_stockDay) {
	    var distance = 0;
	    var next = _stockDay.next;

	    for (var j = 0;j < 5;j++)
	    {
		if (distance <= max_dist)
		{
		    var vol = abs(_stockDay.stocks[j].volume - stocks[j].volume) / 10;

		    if (vol > 10) vol = 10;
		    
		    distance += 
			abs(_stockDay.stocks[j].open - stocks[j].open) + abs(_stockDay.stocks[j].close - stocks[j].close) + vol;
		}
	    }
	    
	    if (distance <= max_dist)
	    {
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
		    stockResult.h_dec++;

		}

		if (next >=-3 && next <=3) {
		    stockResult.h_normal++;
		}
	    }		    	    	    
	});

	results.push(stockResult);
    }

    return results;
};

module.exports = Analyze_5;
