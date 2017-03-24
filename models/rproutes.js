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
        numberofRoutescompleted    : {type: String, default: ''},
        totalDistanceCompleted     : {type: String, default: ''},
        //bonusPoints                : {type: String, default: ''},
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
        useNails: { 
            activenailStatus       : {type: String, enum: useNails, default: 'INACTIVE'},
            nailsthrownAt          : {type: String, default: false},
            nailsthrownBy          : {type: String, default: false},
        },
        usePatches: { 
            activepatchesStatus    : {type: String, enum: usePatches, default: 'INACTIVE'},
            patchesusedBy          : {type: String, default: false},
        },
        watchVideo: { 
            activevideoStatus      : {type: String, enum: watchVideo, default: 'INACTIVE'},
            numberofvideos         : {type: String, default: false},
        },
        useOil: { 
            activeoilStatus        : {type: String, enum: useOil, default: 'INACTIVE'},
            oilthrownAt            : {type: String, default: false},
            oilthrownBy            : {type: String, default: false},
        },
        useWrench: { 
            activewrenchStatus     : {type: String, enum: useWrench, default: 'INACTIVE'},
            wrenchusedBy           : {type: String, default: false},
        },
        usecar: { 
            activecarStatus        : {type: String, enum: usecar, default: 'INACTIVE'},
            carthrownAt            : {type: String, default: false},
            carthrownBy            : {type: String, default: false},
        },
        towTruck: {
            activetowtruckStatus   : {type: String, enum: towTruck, default: 'INACTIVE'}, 
            towtruckusedBy         : {type: String, default: false},
        },
        policeCar: { 
            activepolicecarStatus  : {type: String, enum: policeCar, default: 'INACTIVE'},
            policecarthrownAt      : {type: String, default: false},
            policecarthrownBy      : {type: String, default: false},
        },
        odometer: {
            activeodometerStatus   : {type: String, enum: odometer, default: 'INACTIVE'}, 
            odometerusedBy         : {type: String, default: false},
        },
        helmets                    : {type: String, default: false}, 
        points                     : {type: String, default: false},    
        purchasetire               : {type: String, default: false},
        lastModifiedDate           : {type: Date, default: Date.now()},        
});

// create the model for rproutes and expose it to our app
module.exports = mongoose.model('rproutes', rproutesSchema);
