var ModuleType = require('../core/enum.js').ModuleAnalyzeType;
var double_btm = require('./module_double_bottom.js');

var buildModule = function(moduleType) {
    var moduleItem = null;
    switch(moduleType)
    {
	case ModuleType.double_bottom:
	moduleItem = new double_btm();
	break;
    }

    return moduleItem;
};

module.exports.buildModule = buildModule;
