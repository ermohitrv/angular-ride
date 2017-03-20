var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var  ObjectId = Schema.ObjectId;

var joineventSchema = Schema({
    eventId       :{type: ObjectId},
    userEmail     :{type: String},
    joined        :{type: Number, default: 0}
});

module.exports = mongoose.model('Joinevents', joineventSchema);
