var RouteTools = require("../models/routetools");
var globalConfig    = require('../config/globals.js');
var RpRoutes        = require('../models/rproutes');


/* function to set json array for points */
this.jsonRoutePoints=function (route)
{   
    var jsonarray = {};
    if(route == 1){
    jsonarray = {
                            "routes":{
                                                    "pointsPerKm":10,
                                                    "pointsAddingFriend":10,
                                                    "pointsUsingAppEveryday":10,
                                                    "bonusPoints":1000,
                                                    "nailStealingPoints":100,
                                                    "nailExtraPoints":25,
                                                    "distanceSubRoute1":3,
                                                    "distanceSubRoute2":4,
                                                    "distanceSubRoute3":3
                                        
                                     }
        };
    }    
    else if(route == 2){
    jsonarray = {
                            "routes":{
                                                                              
                                                    "pointsPerKm":10,
                                                    "pointsAddingFriend":10,
                                                    "pointsUsingAppEveryday":10,
                                                    "bonusPoints":1500,
                                                    "nailStealingPoints":100,
                                                    "nailExtraPoints":25,
                                                    "distanceSubRoute1":10,
                                                    "distanceSubRoute2":5,
                                                    "distanceSubRoute3":10
                                              
                                        }
        };
    }  
    else if(route == 3){
    jsonarray = {
                            "routes":{
                                                                             
                                                    "pointsPerKm":10,
                                                    "pointsAddingFriend":10,
                                                    "pointsUsingAppEveryday":10,
                                                    "bonusPoints":2000,
                                                    "nailStealingPoints":100,
                                                    "nailExtraPoints":25,
                                                    "distanceSubRoute1":10,
                                                    "distanceSubRoute2":20,
                                                    "distanceSubRoute3":20
                                        }
        };
    }
    else if(route == 4){
    jsonarray = {
                            "routes":{
                                                                          
                                                    "pointsPerKm":10,
                                                    "pointsAddingFriend":10,
                                                    "pointsUsingAppEveryday":10,
                                                    "bonusPoints":2500,
                                                    "nailStealingPoints":100,
                                                    "nailExtraPoints":25,
                                                    "oilStealingPoints":250,
                                                    "oilBonusPoints":50,
                                                    "distanceSubRoute1":30,
                                                    "distanceSubRoute2":30,
                                                    "distanceSubRoute3":40
                                               
                                        }
        };
    } 
    else if(route == 5){
    jsonarray = {
                            "routes":{
                                                                             
                                                    "pointsPerKm":10,
                                                    "pointsAddingFriend":10,
                                                    "pointsUsingAppEveryday":10,
                                                    "bonusPoints":3000,
                                                    "nailStealingPoints":100,
                                                    "nailExtraPoints":25,
                                                    "oilStealingPoints":250,
                                                    "oilBonusPoints":50,
                                                    "distanceSubRoute1":50,
                                                    "distanceSubRoute2":50,
                                                    "distanceSubRoute3":150
                                               
                                        }
        };
    }  
    else if(route == 6){
    jsonarray = {
                            "routes":{
                                                                             
                                                    "pointsPerKm":10,
                                                    "pointsAddingFriend":10,
                                                    "pointsUsingAppEveryday":10,
                                                    "bonusPoints":3500,
                                                    "nailStealingPoints":100,
                                                    "nailExtraPoints":25,
                                                    "oilStealingPoints":250,
                                                    "oilBonusPoints":50,
                                                    "distanceSubRoute1":100,
                                                    "distanceSubRoute2":200,
                                                    "distanceSubRoute3":200
                                               
                                        }
        };
    }
    else if(route == 7){
    jsonarray = {
                            "routes":{
                                                                          
                                                    "pointsPerKm":10,
                                                    "pointsAddingFriend":10,
                                                    "pointsUsingAppEveryday":10,
                                                    "bonusPoints":4000,
                                                    "nailStealingPoints":100,
                                                    "nailExtraPoints":25,
                                                    "oilStealingPoints":250,
                                                    "oilBonusPoints":50,
                                                    "carStealingPoints":500,
                                                    "carBonusPoints":75,
                                                    "distanceSubRoute1":200,
                                                    "distanceSubRoute2":300,
                                                    "distanceSubRoute3":150
                                                
                                        }
        };
    }
    else if(route == 8){
    jsonarray = {
                            "routes":{
                                                                               
                                                    "pointsPerKm":10,
                                                    "pointsAddingFriend":10,
                                                    "pointsUsingAppEveryday":10,
                                                    "bonusPoints":4500,
                                                    "nailStealingPoints":100,
                                                    "nailExtraPoints":25,
                                                    "oilStealingPoints":250,
                                                    "oilBonusPoints":50,
                                                    "carStealingPoints":500,
                                                    "carBonusPoints":75,
                                                    "distanceSubRoute1":1000
                                                   
                                                
                                        }
        };
    }  
    else if(route == 9){
    jsonarray = {
                            "routes":{                                       
                                                    "pointsPerKm":10,
                                                    "pointsAddingFriend":10,
                                                    "pointsUsingAppEveryday":10,
                                                    "bonusPoints":5000,
                                                    "nailStealingPoints":100,
                                                    "nailExtraPoints":25,
                                                    "oilStealingPoints":250,
                                                    "oilBonusPoints":50,
                                                    "carStealingPoints":500,
                                                    "carBonusPoints":75,
                                                    "distanceSubRoute1":2500
                                                   
                                                
                                        }
        };
    }  
    else if(route == 10){
    jsonarray = {
                            "routes":{
                                                                               
                                                    "pointsPerKm":10,
                                                    "pointsAddingFriend":10,
                                                    "pointsUsingAppEveryday":10,
                                                    "bonusPoints":10000,
                                                    "nailStealingPoints":100,
                                                    "nailExtraPoints":25,
                                                    "oilStealingPoints":250,
                                                    "oilBonusPoints":50,
                                                    "carStealingPoints":500,
                                                    "carBonusPoints":75,
                                                    "policecarStealingPoints":1000,
                                                    "policecarBonusPoints":100,
                                                    "distanceSubRoute1":5000
                                               
                                    }
        };
    }  
 return jsonarray;
}

/* function to calculate distance according to latitude and longitude */
this.calculateDistance=function (lat1,lng1,lat2,lng2)
{
                    /* get distance between 2 positions */
                    var unit = "K";
                    var radlat1 = Math.PI * lat2/180;
                    var radlat2 = Math.PI * lat1/180;
                    var theta = lng2-lng1;
                    var radtheta = Math.PI * theta/180;
                    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                    dist = Math.acos(dist);
                    dist = dist * 180/Math.PI;
                    dist = dist * 60 * 1.1515;
                    if (unit=="K") { dist = dist * 1.609344; } //kilometers
                    if (unit=="N") { dist = dist * 0.8684; } //nautical miles
                    
                    dist = Math.round(dist * 100) / 100;
                    return dist;
   
}


/* function to update tools in routetools table */
this.updateRouteTools=function (email,tooltype,route)
{
    var numberOfNails     = 0;
    var numberOfPatches   = 0;
    var numberOfHelmets   = 0;
    var numberOfOil       = 0;
    var numberOfCar       = 0;
    var numberOfPolicecar = 0;
    var numberOfOdometer  = 0;
    var numberOfTowTruck  = 0;
    var numberOfWrench    = 0;
    
    RouteTools.findOne({'email': { $regex : new RegExp(email, "i") }}, function(err, getrptools){
        
    if(err){
        
        return err;
        
    }
    else{
        
        if(tooltype == "nailsthrow" && getrptools.numberOfNails > 0){
            
            numberOfNails = getrptools.numberOfNails - 1;
            var obj = {};
            obj['numberOfNails'] = numberOfNails;
        }
        else if(tooltype == "addHelmets"){
            var obj = {};
            if(route >= 1 && route <= 7){
                numberOfHelmets = globalConfig.numberOfHelmetsPerSubRouteCompletion;
            }
            if(route >= 8 && route <= 10 ){
                numberOfHelmets = globalConfig.numberOfHelmetsPerLevelCompletion;
            }
            obj['numberOfHelmets']   = numberOfHelmets;
        }
        else if(tooltype == "watchvideo"){
            numberOfNails = getrptools.numberOfNails + 1;
            numberOfPatches = getrptools.numberOfPatches + 1;
            var obj = {};
            obj['numberOfNails']   = numberOfNails;
            obj['numberOfPatches'] = numberOfPatches;
        }
        else if(tooltype == "oilThrow"){
            numberOfOil = getrptools.numberOfOil - 1;
            var obj = {};
            obj['numberOfOil']   = numberOfOil;
        }
        else if(tooltype == "carThrow"){
            numberOfCar = getrptools.numberOfCar - 1;
            var obj = {};
            obj['numberOfCar']   = numberOfCar;
        }
        else if(tooltype == "policecarThrow"){
            numberOfPolicecar = getrptools.numberOfPolicecar - 1;
            var obj = {};
            obj['numberOfPolicecar']   = numberOfPolicecar;
        }
        else if(tooltype == "usePatch"){
            numberOfPatches = getrptools.numberOfPatches - 1;
            var obj = {};
            obj['numberOfPatches']   = numberOfPatches;
        }
        else if(tooltype == "useWrench"){
            numberOfWrench = getrptools.numberOfWrench - 1;
            var obj = {};
            obj['numberOfWrench']   = numberOfWrench;
        }
        else if(tooltype == "useTowTruck"){
            numberOfTowTruck = getrptools.numberOfTowTruck - 1;
            var obj = {};
            obj['numberOfTowTruck']   = numberOfTowTruck;
        }
        else if(tooltype == "useOdometer"){
            numberOfOdometer = getrptools.numberOfOdometer - 1;
            var obj = {};
            obj['numberOfOdometer']   = numberOfOdometer;
        }
        
        
        RouteTools.update({ 
                            'email': { $regex : new RegExp(email, "i") } ,
                          },
                            { 

                                  $set: obj
                            },
                            { multi: true },
                            function(err1, rptoolinfo){

                                 if (err){
                                        return err1;
                                }else{

                                         return "success";
                                }
        });   
    }
    });
                    
}

/* function to add tools in routetools table on creating a new route */
this.addRouteTools=function (email,tooltype){
    
        if(tooltype == "addNailsPatches"){
            var objRouteTools               = new RouteTools();
            objRouteTools.email             = email;
            objRouteTools.numberOfNails     = globalConfig.numberOfFreeTools;
            objRouteTools.numberOfPatches   = globalConfig.numberOfFreeTools;          
        }
        else if(tooltype == "addOilWrench"){
            var obj = {};
            obj['numberOfOil']              = globalConfig.numberOfFreeTools;
            obj['numberOfWrench']           = globalConfig.numberOfFreeTools;
        }
        else if(tooltype == "addTowTruck"){
            var obj = {};
            obj['numberOfCar']              = globalConfig.numberOfFreeTools;
            obj['numberOfTowTruck']         = globalConfig.numberOfFreeTools;
        }
        else if(tooltype == "addPolicecarOdometer"){
            var obj = {};
            obj['numberOfPolicecar']       = globalConfig.numberOfFreeTools;
            obj['numberOfOdometer']        = globalConfig.numberOfFreeTools;
        }
        
        RouteTools.findOne({'email': { $regex : new RegExp(email, "i") }}, function(err, getrptools){
            if(getrptools){

                    RouteTools.update({ 
                            'email': { $regex : new RegExp(email, "i") } ,
                          },
                            { 

                                  $set: obj
                            },
                            { multi: true },
                            function(err1, rptoolinfo){

                                 if (err){
                                        return err1;
                                }else{

                                         return "success";
                                }
                    }); 

            }
            else{
                objRouteTools.save(function(err,routeCreateInfo){
                if (err){
                     return err;
                }else {
                
                        return "success";
                 
                    }
                });
            }
    });
}


/* function to add tools in routetools table on creating a new route */
this.updateRouteStealingPoints=function (ThrownAt,StealingPoints){
    
        console.log();
        RpRoutes.findOne({'email': { $regex : new RegExp(ThrownAt, "i") }}, function(err, getrproutes){
            if(!err){
                    
                    var obj = {};  
                    var points = getrproutes.points - StealingPoints;
                    obj['points']   =  points;
                    
                    
                    RpRoutes.update({ 
                            'email': { $regex : new RegExp(ThrownAt, "i") } ,
                          },
                            { 

                                  $set: obj
                            },
                            { multi: true },
                            function(err1, rptoolinfo){

                                 if (err){
                                        return err1;
                                }else{

                                         return "success";
                                }
                    }); 

            }
            else{
                
                    return err;
                 
            }
    });
}