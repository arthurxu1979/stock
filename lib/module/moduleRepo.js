
var module_repo = [];

var resetRepo = function() {
    while(module_repo.length > 0)
	module_repo.pop();
};

var addToModuleRepo = function(_code, _type) {
    module_repo.push({stock_code:_code, module:_type});
};

var getRepoCodes = function() {
    return module_repo;
};

module.exports.resetRepo = resetRepo;
module.exports.addToModuleRepo = addToModuleRepo;
module.exports.getRepoCodes = getRepoCodes;
