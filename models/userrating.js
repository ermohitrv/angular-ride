var mongoose                = require('mongoose');

var userratingSchema = mongoose.Schema({
    rating:     {type: String, default: ''},    //out of 1-10
    ratingBy:   {type: String, default: ''},    //email of user who gives rating
    ratingTo:   {type: String, default: ''}     //email of user to whom rating is given
});

// create the model for rproutes and expose it to our app
module.exports = mongoose.model('userrating', userratingSchema);
