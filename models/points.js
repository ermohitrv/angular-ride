var mongoose         = require('mongoose');


var rproutespointsSchema = mongoose.Schema({
        route                      : {type: String, default: ''},
        numberofroutes             : {type: String, default: ''},
        totalDistance              : {type: String, default: ''},        
        pointsPerkm                : {type: String, default: ''},
        pointsAddingfriend         : {type: String, default: ''},
        pointsUsingappeveryday     : {type: String, default: ''},
        bonusPoint                 : {type: String, default: ''},
        nailStealingpoints         : {type: String, default: ''},
        nailExtrapoints            : {type: String, default: ''},
        oilStealingpoints          : {type: String, default: ''},
        oilExtrapoints             : {type: String, default: ''}, 
        carStealingpoints          : {type: String, default: ''},
        carExtrapoints             : {type: String, default: ''}, 
        policecarStealingpoints    : {type: String, default: ''},
        policecarExtrapoints       : {type: String, default: ''},    
        //startinglocationLat        : {type: String, default: ''},
        //startinglocationLng        : {type: String, default: ''},
        //endinglocationLat          : {type: String, default: ''},
        //endinglocationLng          : {type: String, default: ''},
             
});

// create the model for rproutes and expose it to our app
module.exports = mongoose.model('rproutespoints', rproutespointsSchema);
