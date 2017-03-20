var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var notification    = 'request invitation follow acceptrequest eventjoined'.split(' ');

var activitySchema = Schema({
    notificationTo:            {type: String},    //email
    notificationBy:            {type: String},    //email
    notificationType:          {type: String , enum: notification, default: ''},
    addedOn:                   {type: Date, default: Date.now()}
});

module.exports = mongoose.model('activities', activitySchema);
