var util = require('util');

var Level = {
    warning: 3,
    info: 2,
    debug: 1
};

var logger = function(name) {
    this.loggerName = name;
    this.level = Level.debug;
    this.logHeader = ' ';
    this.enable = true;
};

logger.prototype.configureLevel = function(level) {
    switch(level)
    {
	case 'debug':
	this.level = Level.debug;
	break;
	case 'info':
	this.level = Level.info;
	break;
	case 'warning':
	this.level = Level.warning;
	break;
	default:
	this.level = Level.debug;	
    }
};

logger.prototype.printLog = function(message) {
    message = this.logHeader + this.loggerName + ': ' + message
    util.log(message);
};

logger.prototype.info = function () {
    if (this.enable)
    {
	this.logHeader = 'INFO: ';
	var args = Array.prototype.slice.call(arguments);
	this.log(this.getLogMessage(args) , Level.info);
    }
};

logger.prototype.log = function (message, log_level) {
    if (this.level <= log_level)
    {
	this.printLog(message);
    }
};

logger.prototype.getLogMessage = function (args) {
    var argMsg = []
    for (var i = 0;i < args.length; i++){
	var msg = args[i];
	if (typeof args[i] === 'object')
	{
	    msg = util.format('%j', args[i]);
	}

	argMsg.push(msg);
    }

    return argMsg.join(' ');
};

logger.prototype.warn = function () {
    if(this.enable)
    {
	this.logHeader = 'WARN: ';
	var args = Array.prototype.slice.call(arguments);    
	this.log(this.getLogMessage(args), Level.warning);
    }
};

logger.prototype.debug = function () {
    if(this.enable)
    {
	this.logHeader = 'DEBUG: ';
	var args = Array.prototype.slice.call(arguments);
	this.log(this.getLogMessage(args), Level.debug);
    }
};

module.exports = logger;
















    
