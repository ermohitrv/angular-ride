var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var joineventSchema = Schema({
    eventId       :{type: String},
    userEmail     :{type: String},
    joined        :{type: Number, default: 0}
});

module.exports = mongoose.model('Joinevents', joineventSchema);
