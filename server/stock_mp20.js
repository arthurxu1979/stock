var mpProcessor = require('../lib/process/analyzeProcessor.js');
var TaskProcessor = require('../lib/core/status.js').TaskProcessor;

var begin = new Date();
mpProcessor.initProcessor();
mpProcessor.startAnalyzeProcessor(TaskProcessor.stock_analyze_15, null, function(){
    mpProcessor.endProcessor();
    var span = (new Date().getTime() - begin.getTime()) / 1000;
    console.log('duration:' + span);    
});

