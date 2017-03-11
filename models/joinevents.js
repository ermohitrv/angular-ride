var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var joineventSchema = Schema({
    eventId       :{type: String},
    userEmail     :{type: String},
});

module.exports = mongoose.model('Joinevents', joineventSchema);
