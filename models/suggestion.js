var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var respondStatus   = 'pending respond'.split(' ');


var suggestionSchema = Schema({
    suggestionName:         {type: String},    //name
    suggestionEmail:        {type: String},    //email
    suggestionPhone:        {type: String},    
    suggestionDescription:  {type: String},
    respondStatus:          {type: String,enum: respondStatus, default: 'pending'},
    addedOn:                {type: Date, default: Date.now()}
});

module.exports = mongoose.model('suggestions', suggestionSchema);
