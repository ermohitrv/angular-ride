var mongoose         = require('mongoose');
var rideStatus       = 'ACTIVE INACTIVE'.split(' ');
var useNails         = 'ACTIVE INACTIVE'.split(' ');
var usePatches       = 'ACTIVE INACTIVE'.split(' ');
var watchVideo       = 'ACTIVE INACTIVE'.split(' ');
var useOil           = 'ACTIVE INACTIVE'.split(' ');
var useWrench        = 'ACTIVE INACTIVE'.split(' ');
var usecar           = 'ACTIVE INACTIVE'.split(' ');
var towTruck         = 'ACTIVE INACTIVE'.split(' ');
var policeCar        = 'ACTIVE INACTIVE'.split(' ');
var odometer         = 'ACTIVE INACTIVE'.split(' ');
var invitedFriends   = 'ACTIVE INACTIVE'.split(' ');
var routeCompleted   = 'CREATED COMPLETED ONGOING FAILED'.split(' ');

var rproutesSchema = mongoose.Schema({
        email                      : {type: String, default: ''},
        route                      : {type: String, default: ''},
        numberofRoutescompleted    : {type: Number, default: 0},
        totalDistanceCompleted     : {type: String, default: ''},
        startinglocationLat        : {type: String, default: ''},
        startinglocationLng        : {type: String, default: ''},
        endinglocationLat          : {type: String, default: ''},
        endinglocationLng          : {type: String, default: ''}, 
        currentlocationLat         : {type: String, default: ''},
        currentlocationLng         : {type: String, default: ''},
        location                   : {type : Array, default : [] },
        creationTime               : {type: Date, default: Date.now()},
        activeStatus               : {type: String, enum: rideStatus, default: 'INACTIVE'},
        isRouteCompleted           : {type: String,enum: routeCompleted, default: 'FAILED'},
        invitedFriends: { 
            friendsList            : {type : Array, default : [] },
        },        
        nailsthrownAt              : {type: Array, default : []},
        patchesusedBy              : {type : Array, default : []},
        numberofvideos             : {type: Number, default: 0},
        oilthrownAt                : {type : Array, default : []},
        wrenchusedBy               : {type : Array, default : []},
        carthrownAt                : {type : Array, default : []},
        towtruckusedBy             : {type : Array, default : []},
        policecarthrownAt          : {type : Array, default : []},
        odometerusedBy             : {type : Array, default : []},
        points                     : {type: String, default: '0'},    
        purchasetire               : {type: String, default: false},
        lastModifiedDate           : {type: Date, default: Date.now()},        
});

// create the model for rproutes and expose it to our app
module.exports = mongoose.model('rproutes', rproutesSchema);
