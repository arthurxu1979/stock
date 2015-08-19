var assert = require("assert"),
    Timespan = require('./../index');


describe('Timespan',function() {
    describe('constructor',function() {

        it('it should be created with new', function() {
            assert.ok(new Timespan() instanceof Timespan);
        });

        it('should be created without new',function() {
            assert.ok(Timespan() instanceof Timespan);
        });

        it('should start at zero with no parameter',function(){
            assert.equal(Timespan().span,0);
        });

        it('should accept a number as a parameter',function(){
            var ts = new Timespan().addMillisecond(123);
            assert.equal(ts.span,new Timespan(123).span);
            assert.equal(ts.span,Timespan(123).span);
        });

        it('should accept a timespan as a parameter',function() {

            var ts = new Timespan().addMillisecond(123);
            assert.ok(new Timespan(ts));
            assert.equal(ts.span, new Timespan(ts).span);
        });

        it('should be seperate instances',function(){
            assert.notEqual(new Timespan(),new Timespan());
            assert.notEqual(new Timespan(123),new Timespan(123));

            assert.notEqual(Timespan(),Timespan());
            assert.notEqual(Timespan(123),Timespan(123));
            
        });
    });

    describe('add time',function() {

        it('should add one millisecond',function(){
            var ms = new Timespan();
            ms.addMillisecond(1);
            assert.equal(ms.span,1);
        });

        it('should add one second',function(){
            var ms = new Timespan();
            ms.addSecond(1);
            assert.equal(ms.span,1000);
        });

        it('should add one minute',function(){
            var ms = new Timespan();
            ms.addMinute(1);
            assert.equal(ms.span,(1000*60));
        });

        it('should add one hour',function(){
            var ms = new Timespan();
            ms.addHour(1);
            assert.equal(ms.span,(1000*60*60));
        });

        it('should add one hour',function() {
            var ms = new Timespan();
            ms.addDay(1);
            assert.equal(ms.span,(1000*60*60*24));
        });

        it('should allow chaining adds',function(){
            var ms = new Timespan();
            ms.addMillisecond(1).addSecond(1).addMinute(1);
            assert.equal(ms.span,61001);
        });
    });

    describe('timespan toString',function(){
        it('should use singular form for one unit',function(){
            var ts;

            ts = new Timespan().addMillisecond(1);
            assert.equal(ts.toString(),'1 millisecond');

            ts = new Timespan().addSecond(1);
            assert.equal(ts.toString(),'1 second');

            ts = new Timespan().addMinute(1);
            assert.equal(ts.toString(),'1 minute');

            ts = new Timespan().addHour(1);
            assert.equal(ts.toString(),'1 hour');

            ts = new Timespan().addDay(1);
            assert.equal(ts.toString(),'1 day');

        });

        it('should use plural form for greater than 1 unit',function() {
            var ts;

            ts = new Timespan().addMillisecond(2);
            assert.equal(ts.toString(),'2 milliseconds');

            ts = new Timespan().addSecond(2);
            assert.equal(ts.toString(),'2 seconds');

            ts = new Timespan().addMinute(2);
            assert.equal(ts.toString(),'2 minutes');

            ts = new Timespan().addHour(2);
            assert.equal(ts.toString(),'2 hours');

            ts = new Timespan().addDay(2);
            assert.equal(ts.toString(),'2 days');

        });

        it('should display all units together',function(){

            var ts = new Timespan().addSecond(1).addMinute(1).addHour(1);
            assert.equal(ts.toString(),'1 hour 1 minute 1 second');

            ts = new Timespan().addSecond(2).addMinute(2).addHour(2);
            assert.equal(ts.toString(),'2 hours 2 minutes 2 seconds');
        });
    });

    describe('date object additions',function(){
        it('date object should have add timespan function',function(){
            var d = new Date();
            assert.ok(d.addTimespan);
        });

        it('ts should have add to date function',function(){
            var ts = new Timespan();
            assert.ok(ts.addToDate);
        });
    });
});