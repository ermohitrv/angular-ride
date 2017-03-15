var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventSchema = Schema({
    eventName       :{type: String},
    eventType       :{type: String},
    eventLocation   :{type: String},
    eventLocationType :{type: String},
    eventHost       :{type: String},
    description     :{type: String},
    startDate       :{type: Date},
    endDate         :{type: Date},
    startTime       :{type: String},
    endTime         :{type: String},
    eventImage      :{type: String,default:'', maxlength: 450},
    userEmail       :{type: String}
});

module.exports = mongoose.model('Events', eventSchema);
