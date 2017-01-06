var mongoose                = require('mongoose');
var rideStatus              = 'ACTIVE INACTIVE'.split(' ');

var rproutesSchema = mongoose.Schema({
    email:              {type: String, default: ''},
    rproute1:{
        locationLat:    {type: String, default: ''},
        locationLng:    {type: String, default: ''},
        creationTime:   {type: Date, default: Date.now()},
        activeStatus:   {type: String, enum: rideStatus, default: 'INACTIVE'},
        invitedFriends: {type : Array, default : [] },
    },
    rproute2:{
        locationLat:    {type: String, default: ''},
        locationLng:    {type: String, default: ''},
        creationTime:   {type: Date, default: Date.now()},
        activeStatus:   {type: String, enum: rideStatus, default: 'INACTIVE'},
        invitedFriends: {type : Array, default : [] },
    },
    rproute3:{
        locationLat:    {type: String, default: ''},
        locationLng:    {type: String, default: ''},
        creationTime:   {type: Date, default: Date.now()},
        activeStatus:   {type: String, enum: rideStatus, default: 'INACTIVE'},
        invitedFriends: {type : Array, default : [] },
    }
});

// create the model for rproutes and expose it to our app
module.exports = mongoose.model('rproutes', rproutesSchema);
