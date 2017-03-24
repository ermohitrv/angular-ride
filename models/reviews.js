var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var reviewStatus   = 'PENDING APPROVED'.split(' ');

var reviewSchema = Schema({
    productId       :{type: String},
    username        :{type: String},
    userReview      :{type: String,default:''},
    ReviewStatus    :{type: String,enum: reviewStatus, default: 'PENDING'},
    userRating      :{type: String,default:''},
    addedOn         :{type: Date,default: Date.now()}
    
});

module.exports = mongoose.model('Reviews', reviewSchema);
