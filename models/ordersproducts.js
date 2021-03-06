var mongoose         = require('mongoose');
var Schema = mongoose.Schema;
var  ObjectId = Schema.ObjectId;

var ordersproductsSchema = mongoose.Schema({
        order_id                   : {type: ObjectId},
        product_title              : {type: String, default: ''},
        product_quantity           : {type: String, default: ''},
        product_color              : {type: String, default: ''},
        product_size               : {type: String, default: ''},
        product_item_price         : {type: String, default: ''},
        product_total_item_price   : {type: String, default: ''},
        product_link               : {type: String, default: ''},   
});

// create the model for rproutes and expose it to our app
module.exports = mongoose.model('ordersproducts', ordersproductsSchema);
