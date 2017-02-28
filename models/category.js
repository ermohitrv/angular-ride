var mongoose                = require('mongoose');
//ride config variables
var categorySchema = mongoose.Schema({
    category_title:          {type: String, default: ''},
    category_short_description: {type: String, default: ''},
    category_description:    {type: String, default: ''},
    category_added_date:     {type: Date, default: Date.now()}
});

// create the model for products and expose it to our app
module.exports = mongoose.model('categories', categorySchema);
