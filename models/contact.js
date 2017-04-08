var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var respondStatus   = 'pending respond'.split(' ');


var contactSchema = Schema({
    contactName:            {type: String},    //name
    contactEmail:           {type: String},    //email
    contactLocation:        {type: String},    
    contactPhone:           {type: String},    
    contactSubject:         {type: String},    
    contactDescription:     {type: String},
    respondStatus:          {type: String,enum: respondStatus, default: 'pending'},
    addedOn:                {type: Date, default: Date.now()}
});

module.exports = mongoose.model('contacts', contactSchema);
