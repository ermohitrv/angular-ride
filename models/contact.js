var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contactSchema = Schema({
    contactName:            {type: String},    //name
    contactEmail:           {type: String},    //email
    contactSubject:         {type: String},    //email
    contactDescription:     {type: String},
    addedOn:                {type: Date, default: Date.now()}
});

module.exports = mongoose.model('contacts', contactSchema);
