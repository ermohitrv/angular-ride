var RouteTools = require("../models/routetools");
/* function to set json array for points */
this.jsonRoutePoints=function (route)
{   
    var jsonarray = {};
    if(route == "1"){
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
    else if(route == "2"){
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
    else if(route == "3"){
    jsonarray = {
                            "routes":{
                                                                             
                                                    "pointsPerKm":10,
                                                    "pointsAddingFriend":10,
                                                    "pointsUsingAppEveryday":10,
                                                    "bonusPoints":2000,
                                                    "nailStealingPoints":100,
                                                    "nailExtraPoints":25,
                                                    "distanceSubRoute1":10,
                                                    "distanceSubRoute2":5,
                                                    "distanceSubRoute3":10
                                        }
        };
    }
    else if(route == "4"){
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
                                                    "distanceSubRoute1":10,
                                                    "distanceSubRoute2":5,
                                                    "distanceSubRoute3":10
                                               
                                        }
        };
    } 
    else if(route == "5"){
    jsonarray = {
                            "routes":{
                                                                             
                                                    "pointsPerKm":10,
                                                    "pointsAddingFriend":10,
                                                    "pointsUsingAppEveryday":10,
                                                    "bonusPoints":3000,
                                                    "nailStealingPoints":100,
                                                    "nailExtraPoints":25,
                                                    "oilStealingPoints":250,
                                                    "oilBonusPoints":50                                     
                                               
                                        }
        };
    }  
    else if(route == "6"){
    jsonarray = {
                            "routes":{
                                                                             
                                                    "pointsPerKm":10,
                                                    "pointsAddingFriend":10,
                                                    "pointsUsingAppEveryday":10,
                                                    "bonusPoints":3500,
                                                    "nailStealingPoints":100,
                                                    "nailExtraPoints":25,
                                                    "oilStealingPoints":250,
                                                    "oilBonusPoints":50 
                                               
                                        }
        };
    }
    else if(route == "7"){
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
                                                    "carBonusPoints":75
                                                
                                        }
        };
    }
    else if(route == "8"){
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
                                                    "carBonusPoints":75                                      
                                                
                                        }
        };
    }  
    else if(route == "9"){
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
                                                    "carBonusPoints":75                                       
                                                
                                        }
        };
    }  
    else if(route == "10"){
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
                                                    "policecarBonusPoints":100  
                                               
                                    }
        };
    }  
 return jsonarray;
}

/* function to calculate distance completed by user according to starting and current location */
this.distanceCompleted=function (startlat,startlon,currentlat,currentlon)
{
     /* get distance between 2 positions */
                    var unit = "K";
                    var radlat1 = Math.PI * currentlat/180;
                    var radlat2 = Math.PI * startlat/180;
                    var theta = currentlon-startlon;
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

/* function to calculate total distance as per route according to starting and ending location */
this.totalDistance=function (startlat,startlon,endlat,endlon)
{
                    /* get distance between 2 positions */
                    var unit = "K";
                    var radlat1 = Math.PI * endlat/180;
                    var radlat2 = Math.PI * startlat/180;
                    var theta = endlon-startlon;
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


/* function to calculate current distance as per route according to last current lat long */
this.currentdistanceCompleted=function (lastCurrentLocationLat,lastCurrentLocationLng,currentlat,currentlon)
{
     /* get distance between 2 positions */
                    var unit = "K";
                    var radlat1 = Math.PI * currentlat/180;
                    var radlat2 = Math.PI * lastCurrentLocationLat/180;
                    var theta = currentlon-lastCurrentLocationLng;
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

/* function to add helmets in routetools table */
this.addHelmets=function (email)
{
    RouteTools.update({ 
                        'email': { $regex : new RegExp(email, "i") } ,
                      },
                        { 
                            $set:{ 
                                    'numberOfHelmets': 60,
                                 } 
                        },
                        { multi: true },
                        function(err, rptoolinfo){

                             if (err){
                                    return err;
                            }else{

                                     return "success";
                            }
    });              
                    
}

/* function to update nails in routetools table */
this.updateNailsPatches=function (email,nailsthrow)
{
    var numberOfNails = 0;
    var numberOfPatches = 0;
    
    RouteTools.findOne({'email': { $regex : new RegExp(email, "i") }}, function(err, getrptools){
    if(err){
        
        return err;
        
    }
    else{
        
        if(nailsthrow == "nailsthrow" && getrptools.numberOfNails > 0){
            numberOfNails = getrptools.numberOfNails - 1;
            var obj = {};
            obj['numberOfNails'] = numberOfNails;
        }
        if(nailsthrow == "watchvideo"){
            numberOfNails = getrptools.numberOfNails + 1;
            numberOfPatches = getrptools.numberOfPatches + 1;
            var obj = {};
            obj['numberOfNails']   = numberOfNails;
            obj['numberOfPatches'] = numberOfPatches;
        }
        
        RouteTools.update({ 
                            'email': { $regex : new RegExp(email, "i") } ,
                          },
                            { 
//                                $set:{ 
//                                        'numberOfNails': numberOfNails,
//                                     } 
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