var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var followerSchema = Schema({
    followTo:      {type: String},    //email
    followedBy:            {type: String},    //email
    addedOn:               {type: Date, default: Date.now()},
});

module.exports = mongoose.model('followers', followerSchema);
