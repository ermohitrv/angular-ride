var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var statusMode    = 'pending accept reject'.split(' ');

var invitationSchema = Schema({
    eventId                :{type: String},
    invitationSentTo:            {type: String},    //email
    invitationSentBy:            {type: String},    //email
    invitationApprovalStatus:    {type: String, enum: statusMode, default: 'pending'},
    invitationSentDate:          {type: Date, default: Date.now()},
});

module.exports = mongoose.model('invitations', invitationSchema);
