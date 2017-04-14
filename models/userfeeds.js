var mongoose                = require('mongoose');
var postType                = 'status photo video'.split(' ');


var userfeedsSchema = mongoose.Schema({
    
    email:                   {type: String, default: ''},
    postType:                {type: String, enum: postType, default: 'status'}, 
    caption:                 {type: String, default: ''},
    postURL:                 {type: String, default: ''},
    addedOn:                 {type: Date, default: Date.now()},
   
});


// create the model for users and expose it to our app
module.exports = mongoose.model('userfeeds', userfeedsSchema);
