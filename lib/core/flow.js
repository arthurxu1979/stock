var FlowState = require('./status.js').FlowState;
var ItemState = require('./status.js').ItemState;

var Flow = function(stock) {
    this.code = stock.stock_code;
    this.stock = stock;
    this.state = FlowState.Running;
    this.tasks = [];
};

Flow.prototype.addTask = function(_task) {
    _task.state = ItemState.Initial;
    this.tasks.push(_task);
};

Flow.prototype.updateTask = function(_task) {
    for (var i = 0;i < this.tasks.length; i++) {
	var task = this.tasks[i];
	if (task.id == _task.id && task.processor == _task.processor) {
	    this.tasks[i].state = _task.state;
	    break;
	}
    }

    this.updateFlowState();
};

Flow.prototype.updateFlowState = function () {
    var st = FlowState.Ended;
    for (var i = 0;i < this.tasks.length; i++)
    {
	if (this.tasks[i].state != ItemState.Error && this.tasks[i].state != ItemState.Ended)
	{
	    st = FlowState.Running;
	}
    }

    this.state = st;    
};

module.exports = Flow;
