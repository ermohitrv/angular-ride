var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var statusMode    = 'pending accept reject'.split(' ');

var friendsSchema = Schema({
    friendRequestSentTo:            {type: String},    //email
    friendRequestSentBy:            {type: String},    //email
    friendRequestApprovalStatus:    {type: String, enum: statusMode, default: 'pending'},
    friendRequestSentDate:          {type: Date, default: Date.now()},
    friendRequestSeen:  	    {type: Number, default: 0}
});

module.exports = mongoose.model('friends', friendsSchema);
