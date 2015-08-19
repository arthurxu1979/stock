(function() {
    'use strict';
    
    var root = this;

    function extend(consumer,provider) {
        for(var key in provider) {
            if(provider.hasOwnProperty(key)) {
                consumer[key] = provider[key];
            }
        }
    }
        
    function Timespan() {
        if (!(this instanceof Timespan)) {
            return (arguments.length === 0) ? new Timespan() : new Timespan(arguments[0]);
        }

        if(arguments.length !== 0) {

            if(typeof arguments[0] === 'number') {
                this.span = arguments[0];
            } else if(arguments[0] instanceof Timespan) {
                this.span = arguments[0].span;
            }
        } else {
            this.span = 0;
        }

        return this;
    }

    /* Add timespan functions to prototype */
    extend(Timespan.prototype,{
        time:{
                millisecond: 1,
                second: (1 * 1000),
                minute: (1 * 1000 * 60),
                hour: (1 * 1000 * 60 * 60),
                day: (1 * 1000 * 60 * 60 * 24)
            },
        addMillisecond:function(num) {
                        this.span += (num * this.time.millisecond);
                        return this;
                    },
        addSecond:function(num) {
                        this.span += (num * this.time.second);
                        return this;
                    },
        addMinute:function(num) {
                        this.span += (num * this.time.minute);
                        return this;
                    },
        addHour:function(num) {
                        this.span += (num * this.time.hour);
                        return this;
                    },
        addDay:function(num) {
                        this.span += (num * this.time.day);
                        return this;
                    },
        addToDate:function(d) {
                        return new Date(d.getTime() + this.span);
                    },
        toString:function() {
                        var s = this.span,
                            r = '',
                            time = [],
                            n = ['day','hour','minute','second','millisecond'];
                            
                            for(var k in this.time) {
                                time.push(this.time[k]);
                            }
                            
                            time.reverse();
                            for(var i=0; i < time.length;i++) {
                                if( s/time[i] >= 1) {
                                    var num = parseInt((s/time[i]),10);

                                    r += num + ' ' +  ((num === 1 )? n[i]+ ' '  : n[i]+ 's ');
                                    s = s % time[i];
                                }
                            }
                        return r.trimRight();
                    },
        setTimeout:function(fn) {
            return setTimeout(fn,this.span);
        },
        setInterval:function(fn) {
            return setInterval(fn,this.span);
        }
    });


    /* Add Timespan function to date prototype */
    extend(Date.prototype,{
        addTimespan:function(ts) {
                        return new Date(this.getTime() + ts.span);
                    },

    });

    if (typeof exports !== 'undefined') module.exports = exports = Timespan;
    else root.Timespan = Timespan;

}).call(this);