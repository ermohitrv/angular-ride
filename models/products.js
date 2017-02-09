var mongoose                = require('mongoose');
//ride config variables
var productsSchema = mongoose.Schema({
    product_title:          {type: String, default: ''},
    product_sku:            {type: String, default: ''},
    product_price:          {type: String, default: ''},
    product_published:      {type: String, default: ''},
    product_permalink:      {type: String, default: ''},
    product_short_description: {type: String, default: ''},
    product_description:    {type: String, default: ''},
    product_added_date:     {type: Date, default: Date.now()},
    product_rating:         {type: String, default: 0},
    product_category:       {type : Array, default : [] },
    product_brand:          {type : Array, default : [] },
    product_size:           {type : Array, default : [] },
    product_image:          {type : Array, default : [] }
});

// create the model for products and expose it to our app
module.exports = mongoose.model('products', productsSchema);
