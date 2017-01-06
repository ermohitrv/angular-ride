var mongoose                = require('mongoose');
var bcrypt                  = require('bcrypt-nodejs');
var genders                 = 'MALE FEMALE OTHER'.split(' ');
var userLevel               = 'NORMAL MODERATOR ADMIN'.split(' ');
var userActive              = 'ACTIVE INACTIVE'.split(' ');
var featuredMode            = 'true false'.split(' ');

var rprouteSchema = mongoose.Schema({
    email:              {type: String, default: ''},
    rproute1:{
        locationLat:    {type: String, default: ''},
        locationLng:    {type: String, default: ''},
        creationTime:   {type: String, default: ''}
    },
    rproute2:{
        locationLat:    {type: String, default: ''},
        locationLng:    {type: String, default: ''},
        creationTime:   {type: String, default: ''}
    },
    rproute3:{
        locationLat:    {type: String, default: ''},
        locationLng:    {type: String, default: ''},
        creationTime:   {type: String, default: ''}
    }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('rproutes', rprouteSchema);
