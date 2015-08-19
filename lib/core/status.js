
var ItemState = {
    Initial: 'Init',
    Loaded: 'Loaded',
    Running: 'Running',
    Ended: 'Ended',
    Error: 'Error'
};

var FlowState = {
    Running: 'Running',
    Ended: 'Ended'
};

var TaskProcessor = {
    stock_file: 'stock_file',
    stock_import: 'stock_import',
    stock_init_5: 'stock_init_5',
    stock_init_20avg: 'stock_init_20avg',
    stock_init_15: 'stock_init_15',
    stock_analyze_5: 'stock_analyze_5',
    stock_analyze_20: 'stock_analyze_20',
    stock_analyze_15: 'stock_analyze_15'
};

var FlowOperation = {
    flow_import: 'import',
    flow_init: 'init',
    flow_analyze: 'analyze'    
};

module.exports.TaskProcessor = TaskProcessor;
module.exports.ItemState = ItemState;
module.exports.FlowState = FlowState;
module.exports.FlowOperation = FlowOperation;
