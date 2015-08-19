var processor = require('../lib/process/stockInitProcessor.js');
var TaskProcessor = require('../lib/stocks/processItemBuilder.js').TaskProcessor;

processor.startImportProcessor(TaskProcessor.stock_init_5);

