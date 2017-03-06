var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventSchema = Schema({
    eventName       :   {type: String},
    eventType       :   {type: String},
    eventLocation      :   {type: String},
    eventHost     :   {type: String},
    description :   {type: String},
    start   :   {type: Date},
    end     :   {type: Date},
    userEmail      :   {type: String}
});

module.exports = mongoose.model('Events', eventSchema);
