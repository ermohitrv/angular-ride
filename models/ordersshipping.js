var mongoose         = require('mongoose');


var ordersshippingSchema = mongoose.Schema({
        order_id                : {type: String, default: ''},
        order_shipemail                : {type: String, default: ''},
        order_shipfirstname            : {type: String, default: ''},
        order_shiplastname             : {type: String, default: ''},
        order_shipadd1                : {type: String, default: ''},
        order_shipadd2                : {type: String, default: ''},
        order_shipcountry              : {type: String, default: ''},
        order_shipstate                : {type: String, default: ''}, 
        order_shippostcode             : {type: String, default: ''},
        
});

// create the model for rproutes and expose it to our app
module.exports = mongoose.model('ordershipping', ordersshippingSchema);
