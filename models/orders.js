var mongoose         = require('mongoose');


var ordersSchema = mongoose.Schema({
        order_total                : {type: String, default: ''},
        order_email                : {type: String, default: ''},
        order_firstname            : {type: String, default: ''},
        order_lastname             : {type: String, default: ''},
        order_addr1                : {type: String, default: ''},
        order_addr2                : {type: String, default: ''},
        order_country              : {type: String, default: ''},
        order_state                : {type: String, default: ''}, 
        order_postcode             : {type: String, default: ''},
        order_status               : {type: String, default: ''}, 
        order_date                 : {type: Date, default: Date.now()},
//        order_products: { 
//            title                  : {type : String, default : '' },
//            quantity               : {type : String, default : '' },
//            total_item_price       : {type : String, default : '' },
//            link                   : {type : String, default : ''},
//        }        
});

// create the model for rproutes and expose it to our app
module.exports = mongoose.model('orders', ordersSchema);
