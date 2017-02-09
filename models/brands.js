var mongoose                = require('mongoose');
var featuredMode            = 'true false'.split(' ');
//ride config variables
var brandsSchema = mongoose.Schema({
    brand_title:      {type: String, default: ''},
    brand_permalink:  {type: String, default: ''},
    brand_description:{type: String, default: ''},
    brand_image:      {type: String, default: ''},
    brand_featured:   {type: String,enum: featuredMode,default: false},
    brand_added_date: {type: Date, default: Date.now()}
});
// create the model for brands and expose it to our app
module.exports = mongoose.model('brands', brandsSchema);
