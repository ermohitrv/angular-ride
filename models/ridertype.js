var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ridertypeSchema = Schema({
    typeName : {type: String}
});
module.exports = mongoose.model('ridertype', ridertypeSchema);
