var processor = require('../lib/process/stockInitProcessor.js');
var tp = require('../lib/core/status.js').TaskProcessor;

processor.startImportProcessor(tp.stock_init_15);

