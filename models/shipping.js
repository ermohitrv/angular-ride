var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var shippingSchema = Schema({
    shipping_country:       {type: String},    
    shipping_state:         {type: String},   
    shipping_weightfrom:    {type: Number},    
    shipping_weightto:      {type: Number},   
    shipping_price:         {type: String},
    added_on:               {type: Date, default: Date.now()},
});

module.exports = mongoose.model('shippings', shippingSchema);
