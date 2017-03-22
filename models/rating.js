var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ratingSchema = Schema({
    productId       :{type: String},
    username       :{type: String},
    userRating      :{type: String},
    addedOn         :{type: Date,default: Date.now()}
    
});

module.exports = mongoose.model('Rating', ratingSchema);
