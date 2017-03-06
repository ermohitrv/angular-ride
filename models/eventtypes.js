var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventtypesSchema = Schema({
    event_type       :   {type: String},
    eventtype_description       :   {type: String},
    eventtype_added_date   :   {type: Date}
   
});

module.exports = mongoose.model('Eventtypes', eventtypesSchema);
