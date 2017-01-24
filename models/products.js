var mongoose                = require('mongoose');

//ride config variables
var productsSchema = mongoose.Schema({
    product_title:          {type: String, default: ''},
    product_published:      {type: String, default: ''},
    product_price:          {type: String, default: ''},
    product_permalink:      {type: String, default: ''},
    product_description:    {type: String, default: ''},
    product_added_date:     {type: Date, default: Date.now()}
});

// create the model for users and expose it to our app
module.exports = mongoose.model('products', productsSchema);
