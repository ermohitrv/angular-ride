var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var taxSchema = Schema({
    tax_country:       {type: String},    
    tax_state:         {type: String},    
    tax_price:         {type: String},
    added_on:          {type: Date, default: Date.now()},
});

module.exports = mongoose.model('taxes', taxSchema);
