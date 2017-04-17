/* Inititalized required modules */
var express         = require('express');
var bodyParser      = require("body-parser");
var router          = express.Router();
var User            = require('../models/user');
var RpRoutes        = require('../models/rproutes');
var globalConfig    = require('../config/globals.js');
var nodemailer      = require("nodemailer");
var friends         = require('../models/friends');
var Events          = require('../models/events');
var Joinevents      = require('../models/joinevents');
var moment          = require("moment");
var RouteFunction   = require("./routefunction.js");
var RouteTools      = require("../models/routetools");
var FCM             = require('fcm-node');
var serverKey       = 'AAAAFYFV6mc:APA91bFB4RWwB7eaQL_AsyFvg1Dy_TWP-S4g9tWmn5XsaCcS-vR_MNMZbAjsHtziRxNtIZKHBF9bTFWOtvLhdXDJFjppLWf0_tYaktvMEuNzTciCUTpD8qTWuKee5bID0EP4pUo-EFuE';
var fcm             = new FCM(serverKey);

/* API endpoint to be used by mobile device to see all users list */
router.get('/listusers', function(req, res) {
    User.aggregate([{$sort: {'local.username': 1}}], function (err, usersList) {
        if(usersList){
            res.json({
                success: true, 
                data: {
                    users : usersList
                },
                message: "success", 
                code: 200
            });
        }
    });
});

router.get('/login', function(req, res){
    res.json({ 
        success: false, 
        data: null, 
        message: "missing parameters", 
        code: 400
    });
});

router.get('/mylocaction', function(req, res){
    res.json({ 
        success: false, 
        data: null, 
        message: "missing parameters", 
        code: 400
    });
});


/* API endpoint to be used by mobile device to send locaction(lat,lng) on new location */
router.post('/submit-user-rating', function(req, res){
    var rating      = req.body.rating;
    var ratingBy    = req.body.ratingBy;
    var ratingTo    = req.body.ratingTo;
    var Userrating  = require('../models/userrating');
    
    if( ( rating != "" && rating != undefined ) && ( ratingBy != "" && ratingBy != undefined ) && ( ratingTo != "" && ratingTo != undefined ) ){
        
        var usermames = [];
        usermames[0] = ratingBy;
        usermames[1] = ratingTo;
        
        User.find({ 'local.email': { $in: usermames }},function(err,user){
            if (!err){
                var userLength = user.length;
                if(userLength > 1){
                    
                    var newUserRating       = new Userrating();
                    newUserRating.rating    = rating;
                    newUserRating.ratingBy  = ratingBy;
                    newUserRating.ratingTo  = ratingTo;
                    newUserRating.save(function(err){
                        
                        if(err){
                            res.json({ 
                                success: false, 
                                data: null, 
                                message: "error occured while adding rating, "+err, 
                                code: 404
                            });
                        }else{
                            res.json({
                                success: true, 
                                data: {
                                    rating : rating,
                                    ratingBy : ratingBy,
                                    ratingTo : ratingTo
                                },
                                message: "rating updated successfully!", 
                                code: 200
                            });
                        }
                        
                    });
                
                }else{
                    
                    res.json({ 
                        success: false, 
                        data: null, 
                        message: "ratingTo or ratingBy email does not exists in database, please check again!", 
                        code: 404
                    });
                    
                }
                
            }else{
                res.json({ 
                    success: false, 
                    data: null, 
                    message: err, 
                    code: 404
                });
            }
        });
        
    }else{
        
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
        
    }
});

//router.post('/submit-user-rating', function(req, res){
//    var rating      = req.body.rating;
//    var ratingBy    = req.body.ratingBy;
//    var ratingTo    = req.body.ratingTo;
//    var Userrating  = require('../models/userrating');
//    
//    if( ( rating != "" && rating != undefined ) && ( ratingBy != "" && ratingBy != undefined ) && ( ratingTo != "" && ratingTo != undefined ) ){
//        
//        var usermames = [];
//        usermames[0] = ratingBy;
//        usermames[1] = ratingTo;
//        
//        User.find({ 'local.email': { $in: usermames }},function(err,user){
//            if (!err){
//                var userLength = user.length;
//                if(userLength > 1){
//                UserRating.find({ 'ratingTo': ratingTo, 'ratingBy': ratingBy},function(err,newUserRating){
//                    if(!userrating){
//                    var newUserRating       = new Userrating();
//                    newUserRating.rating    = rating;
//                    newUserRating.ratingBy  = ratingBy;
//                    newUserRating.ratingTo  = ratingTo;
//                    }else{
//                        newUserRating.rating    = rating;
//                        newUserRating.ratingBy  = ratingBy;
//                        newUserRating.ratingTo  = ratingTo;
//                    }
//                    newUserRating.save(function(err){
//                        
//                        if(err){
//                            res.json({ 
//                                success: false, 
//                                data: null, 
//                                message: "error occured while adding rating, "+err, 
//                                code: 404
//                            });
//                        }else{
//                            res.json({
//                                success: true, 
//                                data: {
//                                    rating : rating,
//                                    ratingBy : ratingBy,
//                                    ratingTo : ratingTo
//                                },
//                                message: "rating updated successfully!", 
//                                code: 200
//                            });
//                        }
//                        
//                    });
//                });
//                }else{
//                    
//                    res.json({ 
//                        success: false, 
//                        data: null, 
//                        message: "ratingTo or ratingBy email does not exists in database, please check again!", 
//                        code: 404
//                    });
//                    
//                }
//                
//            }else{
//                res.json({ 
//                    success: false, 
//                    data: null, 
//                    message: err, 
//                    code: 404
//                });
//            }
//        });
//        
//    }else{
//        
//        res.json({ 
//            success: false, 
//            data: null, 
//            message: "missing parameters", 
//            code: 400
//        });
//        
//    }
//});
/* API endpoint to be used by mobile device to send locaction(lat,lng) on new location */
router.post('/mylocaction', function(req, res){
    var email = req.body.email;
    var lat   = req.body.lat;
    var lng   = req.body.lng;
    
    if( ( email != "" && email != undefined ) && ( lat != "" && lat != undefined ) && ( lng != "" && lng != undefined ) ){
        User.findOne({ 'local.email' :  { $regex : new RegExp(email, "i") } }, function(err, user) {
            if (err){
                res.json({ 
                    success: false, 
                    data: null, 
                    message: err, 
                    code: 404
                });
            }else if (user == null && user == undefined){
                res.json({ 
                    success: false, 
                    data: null, 
                    message: globalConfig.noUserFound, 
                    code: 404
                });
            }else {
                
            }
        });
    }else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
});

/* API endpoint to be used by mobile device for logging in to site */
router.post('/login', function(req, res){
    var email       = req.body.email;
    var password    = req.body.password;
    var fcmToken    = req.body.fcmToken;
    //var fcmToken   = "test";
    
    console.log("fcmToken : "+fcmToken);
    if( ( email != "" && email != undefined ) && ( password != "" && password != undefined ) ){
        User.findOne({ 'local.email' :  { $regex : new RegExp(email, "i") } }, function(err, user) {
            
            if (err){
                res.json({ 
                    success: false, 
                    data: null, 
                    message: err, 
                    code: 404
                });
            }else if (user == null){
                res.json({ 
                    success: false, 
                    data: null, 
                    message: globalConfig.noUserFound, 
                    code: 404
                });
            }else if (!user.validPassword(password)){
                res.json({ 
                    success: false, 
                    data: null, 
                    message: globalConfig.wrongPassword, 
                    code: 400
                });
            }else if (user != undefined && user != null){
                if(user.local.userActive === 'INACTIVE'){
                    res.json({ 
                        success: false, 
                        data: null, 
                        message: globalConfig.inActiveAccount, 
                        code: 400
                    });
                    req.logout();
                }else{
                    
                    User.update({'local.email' : email },
                        { $set: { 'fcmToken': fcmToken } },
                        { multi: true },

                        function(err, results){
                           if(err){
                                res.json({ 
                                    success: false, 
                                    data: null, 
                                    message: "FCM token error while update", 
                                    code: 404
                                });
                           }else{
                               console.log(results);
                                res.json({ 
                                        success: true,
                                        data: {
                                            firstName       :user.local.firstName,
                                            lastName        :user.local.lastName,
                                            email           :user.local.email,
                                            contact         :user.local.contact,
                                            profileImage    :user.local.profileImage,
                                            rideType        :user.rideType,
                                            rideExperience  :user.rideExperience,
                                            rideCategory    :user.rideCategory,
                                            rproputeInviteLink:globalConfig.websiteUrl+"/invite/"+user.local.username,
                                            fcmToken        :fcmToken,
                                        },
                                        message: "success", 
                                        code: 200
                                });
                            }
                            
                        }
                    );
                   
                }
            }else{
                res.json({ 
                    success: false, 
                    data: null, 
                    message: "bad request", 
                    code: 400
                });
            }
        });
    }else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
});

router.get('/openapp/:username', function(req, res){
    var username = req.params.username;
    res.json({success: true,code: 200,data:{'username':username}});
});

/* API endpoint to be used by mobile device for creating new account on site */
router.post('/signup', function(req, res){
    var email = req.body.email;
    console.log('*** email: '+email);
    
    if(email != "" && email != undefined){
        User.findOne({ 'local.email' :  { $regex : new RegExp(email, "i") } }, function(err, user) {
            // if there are any errors, return the error
            if (err) {
                console.log("error caught 1");
                res.json({ 
                    success: false, 
                    data: null, 
                    message: err, 
                    code: 400
                });
            }
            // check to see if theres already a user with that email
            if (user) {
                console.log("error caught 2");
                res.json({
                    success: false, 
                    data: null, 
                    message: globalConfig.emailExists, 
                    code: 403
                });
            }else{
                // if there is no user with that email
                // create the user
                var username                    = email.substring(0, email.lastIndexOf("@"))+'-'+req.body.lastName;
                var newUser                     = new User();
                var gender                      = req.body.gender;
                newUser.local.username          = username;
                newUser.local.email             = email;
                newUser.local.contact           = req.body.contact;
                newUser.local.password          = newUser.generateHash(req.body.password); // use the generateHash function in our user model
                newUser.local.firstName         = req.body.firstName;
                newUser.local.lastName          = req.body.lastName;
                //newUser.local.gender            = gender;
                //newUser.local.dob               = req.body.dob;
                newUser.local.userLevel         = 'NORMAL';    //default to NORMAL
                newUser.local.userActive        = 'ACTIVE';    //default to ACTIVE
                newUser.local.token             = globalConfig.randomString;
                //newUser.local.username          = username;
                newUser.local.locationCity      = req.body.locationCity;
                newUser.local.locationZipcode   = req.body.locationZipcode;
                newUser.local.locationState     = req.body.locationState;
                newUser.local.locationCountry   = req.body.locationCountry;
                newUser.local.locationLat       = req.body.locationLat;
                newUser.local.locationLng       = req.body.locationLng;
                newUser.local.profileImage      = "http://placehold.it/300?text="+req.body.firstName;
                newUser.rideType                = req.body.rideType;
                newUser.rideExperience          = req.body.rideExperience;
                newUser.rideCategory            = req.body.rideCategory;
                
        	// save the user
                newUser.save(function(err){
                    if (err){
                        console.log("error caught 3");
                        res.json({ 
                            success: false, 
                            data: null, 
                            message: err, 
                            code: 400
                        });
                    }else{
                        res.json({ 
                            success: true,
                            data: 
                                {
                                    firstName       :req.body.firstName,
                                    lastName        :req.body.lastName,
                                    rideType        :req.body.rideType,
                                    rideExperience  :req.body.rideExperience,
                                    rideCategory    :req.body.rideCategory,
                                   
                                },
                            message: globalConfig.successRegister, 
                            code: 200
                        });
                    }
                });
            }
        });
    }else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
});


/* API endpoint to be used by mobile device for reseting password */
router.post('/forget-password', function(req, res){
    var email = req.body.email;
    
    if(email != "" && email != undefined){
        var token = random_token();
        User.findOne({ 'local.email' :  { $regex : new RegExp(email, "i") } }, function (err, user){
            if (user) {
                User.update(
                    { 'local.email': email },
                    { $set: { 'local.token': token } },
                    { multi: true },
                        function(err, results){
                        console.log(results);
                    }
                );

                var base_url = req.headers.host;
                var url_link = base_url + '/create-new-password/'+token;

                var html = 'Hello '+user.local.firstName+', <br>Please click here to create a new password : ';
                html += 'http://'+url_link;
                html += '<br>Thank you, Team Motorcycle';
                
                var mailOptions = {
                    from   : "Motorcycle <no-reply@motorcycle.com>", 
                    to     : email,
                    //to     : "mohit@rvtechnologies.co.in",
                    subject: "Forget Password",
                    html   : html
                };

                nodemailer.mail(mailOptions);
                
                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.json({
                    success: true, 
                    data: {link:'http://'+url_link}, 
                    message: "A link is sent to your email address to create new password", 
                    code: 200
                });
            }else{
                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.json({ 
                    success: false, 
                    data: null, 
                    message: "Email id does not exist", 
                    code: 400
                });
            }
        });
    }else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
});

/* API endpoint to be used by mobile device for changing password inside my account section */
router.get('/change-password', function(req, res){
    res.json({ 
        success: false, 
        data: null, 
        message: "missing parameters", 
        code: 400
    });
});

/* API endpoint to be used by mobile device for adding route on initialization */
/*router.post('/init-add-route', function(req, res){
    var objRoute = new RpRoutes();
    
    var email                = req.body.email;
    var rproute1_locationLat = req.body.rproute1_locationLat;
    var rproute1_locationLng = req.body.rproute1_locationLng;
    
    var rproute2_locationLat = req.body.rproute2_locationLat;
    var rproute2_locationLng = req.body.rproute2_locationLng;
    
    var rproute3_locationLat = req.body.rproute3_locationLat;
    var rproute3_locationLng = req.body.rproute3_locationLng;
    
    objRoute.email                  = email;
    
    objRoute.rproute1.locationLat   = rproute1_locationLat;
    objRoute.rproute1.locationLng   = rproute1_locationLng;
    //objRoute.rproute1.invitedFriends.push( { "email":"invite2@gmail.com" } );
    
    objRoute.rproute2.locationLat   = rproute2_locationLat;
    objRoute.rproute2.locationLng   = rproute2_locationLng;
    //objRoute.rproute2.invitedFriends.push( { "email":"invite2@gmail.com" } );
    
    objRoute.rproute3.locationLat   = rproute3_locationLat;
    objRoute.rproute3.locationLng   = rproute3_locationLng;
    //objRoute.rproute3.invitedFriends.push( { "email":"invite2@gmail.com" } );
    
    objRoute.save(function(err){
        if (err){
            res.json({
                success: false, 
                data: null, 
                message: err, 
                code: 400
            });
        }else {
            
            res.json({
                success: true, 
                data: {
                    
                    rproute1 : {
                        locationLat : rproute1_locationLat,
                        locationLng : rproute1_locationLng,
                        activeStatus: 'INACTIVE',
                        invitedFriends: [],
                    },
                    rproute2 : {
                        locationLat : rproute2_locationLat,
                        locationLng : rproute2_locationLng,
                        activeStatus: 'INACTIVE',
                        invitedFriends: [],
                    },
                    rproute3 : {
                        locationLat : rproute2_locationLat,
                        locationLng : rproute2_locationLng,
                        activeStatus: 'INACTIVE',
                        invitedFriends: [],
                    }
                }, 
                message: "routes added successfully", 
                code: 200
            });
        }
    });
});*/

router.post('/init-add-route', function(req, res){
    var objRoute = new RpRoutes();
    
    var email                = req.body.email;
    var starting_locationLat = req.body.starting_locationLat;
    var starting_locationLng = req.body.starting_locationLng;
    
    var ending_locationLat   = req.body.ending_locationLat;
    var ending_locationLng   = req.body.ending_locationLng;
    var route                = req.body.route;

//    var email                = "test@gmail.com";
//    var starting_locationLat = "1.2393";
//    var starting_locationLng = "1.8184";
//    
//    var ending_locationLat   = "1.5532";
//    var ending_locationLng   = "0.4221";
      
   // RpRoutes.findOne({ 'email' :  { $regex : new RegExp(email, "i") },route:route}, function (err, rpRoute){
//            
//            if(rpRoute){
//                objRoute.route = rpRoute.route  + 1;
//            }else{
//                objRoute.route              = 1;
//            }
            //if(!rpRoute){
            objRoute.route                  = route;
            objRoute.email                  = email;
            objRoute.startinglocationLat    = starting_locationLat;
            objRoute.startinglocationLng    = starting_locationLng;
            objRoute.endinglocationLat      = ending_locationLat;
            objRoute.endinglocationLng      = ending_locationLng;
            objRoute.isRouteCompleted       = 'CREATED';
            //objRoute.rproute1.invitedFriends.push( { "email":"invite2@gmail.com" } );

            objRoute.save(function(err,routeCreateInfo){
                if (err){
                    res.json({
                        success: false, 
                        data: null, 
                        message: err, 
                        code: 400
                    });
                }else {
                    /*
                    * Nails, Patches are unlocked on route 1 for signup user
                    */
                    if(routeCreateInfo.route == 1){
                        
                        RouteFunction.addRouteTools(email,"addNailsPatches");
                    }
                    /*
                    * Oil, Wrench are unlocked on route 4 for signup user
                    */
                    else if(routeCreateInfo.route == 4){
                        RouteFunction.addRouteTools(email,"addOilWrench");
                    }
                    /*
                    * Tow Truck is unlocked on route 7 for signup user
                    */
                    else if(routeCreateInfo.route == 7){
                        RouteFunction.addRouteTools(email,"addTowTruck");
                    }
                    /*
                    * Police car odometer is unlocked on route 10 for signup user
                    */
                    else if(routeCreateInfo.route == 10){
                        RouteFunction.addRouteTools(email,"addPolicecarOdometer");
                    }

                    res.json({
                        success: true, 
                        data: {

                            rproute1 : {
                                locationLat : starting_locationLat,
                                locationLng : starting_locationLng,
                                activeStatus: 'INACTIVE',
                                invitedFriends: [],
                                route:      route,
                                routestatus: "created"
                            },

                        }, 
                        message: "route "+route+" added successfully", 
                        code: 200
                    });
                }
            });
       // }else{
//            res.json({
//                        success: true, 
//                        data: null, 
//                        message: "route "+route+" already created", 
//                        routestatus:"exist",
//                        code: 200
//            });
      //  }
   // }).sort({'lastModifiedDate':-1});
});

/* API endpoint to be used by mobile device for iniviting friend for route */
router.post('/invite-friends-list', function(req, res){
    var email = req.body.email;
    var rproute = req.body.rproute;
    var invitedfriends = req.body.invitedfriends;
    
    if( ( email != "" && email != undefined ) && ( rproute != "" && rproute != undefined ) && ( invitedfriends != "" && invitedfriends != undefined ) ){
    
        if(rproute == 1){
            RpRoutes.update({'email': { $regex : new RegExp(email, "i") } },{
                $push: {  'rproute1.invitedFriends' : { "email": invitedfriends} } 
            },function(err, status){
                if(err){
                    res.json({ 
                        success: false, 
                        data: null, 
                        message: "error: "+err, 
                        code: 400
                    });
                }else{
                    res.json({
                        success: true,
                        data: {
                            'email':email,
                            'invitedfriends':invitedfriends,
                            'rproute':rproute,
                            'isRouteCompleted':false
                        }, 
                        message: "invited friends added to route", 
                        code: 200
                    });
                }
            });
        }else if(rproute == 2){
            RpRoutes.update({'email': { $regex : new RegExp(email, "i") } },{
                $push: {  'rproute2.invitedFriends' : { "email": invitedfriends} } 
            },function(err, status){
                if(err){
                    res.json({ 
                        success: false, 
                        data: null, 
                        message: "error: "+err, 
                        code: 400
                    });
                }else{
                    res.json({
                        success: true,
                        data: {
                            'email':email,
                            'invitedfriends':invitedfriends,
                            'rproute':rproute,
                            'isRouteCompleted':false
                        }, 
                        message: "invited friends added to route", 
                        code: 200
                    });
                }
            });
        }else{
            RpRoutes.update({'email': { $regex : new RegExp(email, "i") } },{
                $push: {  'rproute3.invitedFriends' : { "email": invitedfriends} } 
            },function(err, status){
                if(err){
                    res.json({ 
                        success: false, 
                        data: null, 
                        message: "error: "+err, 
                        code: 400
                    });
                }else{
                    res.json({
                        success: true,
                        data: {
                            'email':email,
                            'invitedfriends':invitedfriends,
                            'rproute':rproute,
                            'isRouteCompleted':false
                        }, 
                        message: "invited friends added to route", 
                        code: 200
                    });
                }
            });
        }
    }else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
});

/* API endpoint to be used by mobile device for changing password inside my account section */
router.post('/change-password', function(req, res){
    var email       = req.body.email;
    var newPassword = req.body.newpassword;
    var oldPassword = req.body.oldpassword;
    if( ( email != "" && email != undefined ) && ( newPassword != "" && newPassword != undefined ) && ( oldPassword != "" && oldPassword != undefined ) ){
        
        User.findOne({ 'local.email' :  { $regex : new RegExp(email, "i") } }, function (err, user){
            
            if(user) {
                
                if (!user.validPassword(oldPassword)){  //case if password incorrect
                    
                    console.log('*** *** Error 3 : '+globalConfig.wrongPassword);
                    
                    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                    res.json({ 
                        success: false, 
                        data: null, 
                        message: globalConfig.wrongPassword, 
                        code: 400
                    });
                    
                }else{
                    
                    var newUser = new User();
                    User.update(
                        { 'local.email': email },
                        { $set: { 'local.password': newUser.generateHash(newPassword) } },
                        { multi: false },
                            function(err, results){
                            console.log(results);
                        }
                    );

                    var html = 'Hello '+user.local.firstName+', <br>Your password has been changed. <p>If you did not made this request please contact us immediately: emailus@bikeriding.com</p>';
                    html += '<p>Thank you, Team Motorcycle</p>';

                    var mailOptions = {
                        from   : "Motorcycle <no-reply@motorcycle.com>", 
                        to     : email,
                        subject: "Password Changed Successfully",
                        html   : html
                    };
                    var mailOptionsTest = {
                        from   : "Motorcycle <no-reply@motorcycle.com>", 
                        to     : "mohit@rvtechnologies.co.in",
                        subject: "Password Changed Successfully",
                        html   : html
                    };

                    nodemailer.mail(mailOptions);
                    nodemailer.mail(mailOptionsTest);

                    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                    res.json({
                        success: true, 
                        data: {email: email}, 
                        message: "Password Changed Successfully", 
                        code: 200
                    });
                }
                
            }else{
                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.json({ 
                    success: false, 
                    data: null, 
                    message: "user does not exist", 
                    code: 400
                });
            }
        });
    }else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
});

/* API endpoint to be used by mobile device for updating profile details */
router.post('/update-profile', function(req, res){
    console.log("sdsdsd");
    var email = req.body.email;
    console.log('**** **** email: '+email);
    
    if( email != "" && email != undefined ){

        var firstName       = req.body.firstName;
        var lastName        = req.body.lastName;
        var contact         = req.body.contact;
        var profileImage    = req.body.profileImage;
        var locationZipcode = req.body.locationZipcode;
        var locationCity    = req.body.locationCity;
        var locationState   = req.body.locationState;
        var locationCountry = req.body.locationCountry;
        var rideType        = req.body.rideType;
        var rideExperience  = req.body.rideExperience;
        var rideCategory    = req.body.rideCategory;
        
        User.findOne({ 'local.email' :  { $regex : new RegExp(email, "i") } }, function (err, user){
            if(user) {
                 
                User.update(
                    {   'local.email': email },
                    {   $set: {
                            'local.firstName': firstName,
                            'local.lastName': lastName,
                            'local.contact': contact,
                            'local.profileImage':profileImage,
                            'local.locationZipcode':locationZipcode,
                            'local.locationCity':locationCity,
                            'local.locationState':locationState,
                            'local.locationCountry':locationCountry,
                            'rideType'        :rideType,
                            'rideExperience'  :rideExperience,
                            'rideCategory'    :rideCategory
                        } 
                    },
                    {   multi: false },
                    function(err, results){
                        if(err){
                            res.json({
                                success: false, 
                                data: null, 
                                message: "error occured : "+err, 
                                code: 400
                            });
                        }else{
                            
                            res.json({
                                success: true, 
                                data: {
                                    email           :email,
                                    firstName       :firstName,
                                    lastName        :lastName,
                                    contact         :contact,
                                    profileImage    :profileImage,
                                    locationZipcode :locationZipcode,
                                    locationCity    :locationCity,
                                    locationState   :locationState,
                                    locationCountry :locationCountry,
                                    rideType        :rideType,
                                    rideExperience  :rideExperience,
                                    rideCategory    :rideCategory
                                }, 
                                message: "profile updated successfully", 
                                code: 200
                            });
                        }
                    }
                );
            }
        });
    }else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
});

/* API endpoint to be used by mobile device for updating profile details */
router.post('/search', function(req, res){
    var name = req.body.name;
    
    if( name != "" && name != undefined ){
        
        User.aggregate({
            $project:   { 
                '_id':0,
                'local.firstName' : 1,
                'local.lastName' : 1,
                'local.email' : 1,
                'local.locationCountry' : 1,
                'local.locationState' : 1,
                'local.locationCity' : 1,
                'local.profileImage' : 1,
                'local.locationLat'  : 1,
                'local.locationLng'  : 1,
                'rideType'          : 1,
                'rideExperience'    : 1,
                'rideCategory'      : 1,
                name: { 
                    $concat:    ["$local.firstName"," ","$local.lastName"]
                }
            }
        }, 
        {
            $match: { name: { $regex : new RegExp(name, "ig") } }
        },function(err, user){
            if(err){
                res.json({ 
                    success: true,
                    data: null, 
                    message: "no record found!", 
                    code: 200
                });
            }else{
                res.json({
                    success: true,
                    data: {
                        user : user
                    }, 
                    message: "records found!", 
                    code: 200
                });
            }
        });
    }else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
});

/*
 * Api route to send friend request
 */
// save friend request
router.post('/send-friend-request', function (req, res) {
    
    var friendRequestBy = req.body.friendRequestBy; //email
    var friendRequestTo = req.body.friendRequestTo; //email
    
    //var friendRequestBy = "preeti_dev@rvtechnologies.co.in"; //email
    //var friendRequestTo = "tester@rvtech.com"; //email
    
   

    if ((friendRequestBy !== undefined && friendRequestBy !== null) && (friendRequestTo !== undefined && friendRequestTo !== null)) {
        User.findOne({'local.email': { $regex : new RegExp(friendRequestTo, "i") }}, function (err, userdata) {
        friends.findOne({'friendRequestSentBy': { $regex : new RegExp(friendRequestBy, "i") }, 'friendRequestSentTo': { $regex : new RegExp(friendRequestTo, "i") }}, function (err, friendReq) {
            if (friendReq) {
                res.json(false);
            } else {
                newFriendReq = new friends;
                newFriendReq.friendRequestSentBy = friendRequestBy;
                newFriendReq.friendRequestSentTo = friendRequestTo;
                newFriendReq.save(function (err) {
                    if (!err) {
                    console.log("fcm token : "+userdata.fcmToken);
                    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                        to: userdata.fcmToken, 
                        
                        notification: {
                            title: 'Request', 
                            body: userdata.local.firstName+" "+userdata.local.lastName+" sent you a friend request." 
                        },

                    };

                    fcm.send(message, function(err, response){
                        if (err) {
                            console.log("Something has gone wrong!");
                                res.json({ 
                                    success: false, 
                                    data: null, 
                                    message: "error occured : "+err, 
                                    code: 400
                                });
                        } else {
                            console.log("Notification Successfully sent with response: ", response);
                                                res.json({ 
                                                    success: true, 
                                                    data: {
                                                        friendRequestSentBy : friendRequestBy,
                                                        friendRequestSentTo: friendRequestTo,
                                                        friendRequestStatus: 'pending'
                                                    }, 
                                                    message: "friend request sent to : "+friendRequestTo, 
                                                    code: 400
                                                });
                        }

                    });
                                 
                    } else {
                        res.json({ 
                            success: false, 
                            data: null, 
                            message: "error occured : "+err, 
                            code: 400
                        });
                    }
                });
            }
        });
    });
        
    }
});

router.get('/new-friend-request', function(req, res){
    var email = req.body.email;
    
    console.log('**** **** email: '+email);
    
    if( email != "" && email != undefined ){
        friends.aggregate(
        [
            {
                $project : { 
                    friendRequestSentBy:1,
                    friendRequestSentTo: 1, 
                    friendRequestApprovalStatus: 1, 
                    friendRequestSentByLowercase : { $toLower: '$friendRequestSentBy' } 
                } 
            }, 
            {
                $sort: {    
                    friendRequestSentByLowercase: 1
                }
            },
            {
                $match: {
                    'friendRequestSentTo': email, 
                    'friendRequestApprovalStatus': 'pending'
                }
            }
        ], function (err, newFriendReq) {

            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

            res.json({ 
                success: false, 
                data: {
                    friendRequestSentTo : email,
                    friendRequestApprovalStatus: 'pending'
                }, 
                message: "friend request sent to : "+email, 
                code: 400
            });
            //res.render('friends', {user: req.user,visitedUser:null, setActiveMenu: 'new-friend-requests', newFriendReq: newFriendReq, isGuest: req.session.isGuest});
        });
    }else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }

});

/* API end point to facebook users  */
router.post('/facebook-create-user', function (req, res) {
     
//        var facebook_id     = "111333333";
//        var username        = "rvtech";
//        var profileImage    = "";
//        var email           = "priya_kaundal@rvtechnolgies.co.in";
//        var contact         = "423434242";
//        var rideType        = "rideType";
//        var rideExperience  = "rideExperience";
//        var rideCategory    = "rideCategory";
//        var locationCity    = "locationCity";
//        var locationZipcode = "locationZipcode";
//        var locationState   = "locationState";
//        var locationCountry = "locationCountry";
//        var locationLat     = "locationLat";
//        var locationLng     = "locationLng";
        
        
        var facebook_id      = req.body.facebook_id;
        var username         = req.body.username;
        var profileImage     = req.body.profileImage;
        var email            = req.body.email;
        var contact          = req.body.contact;
        var rideType         = req.body.rideType;
        var rideExperience   = req.body.rideExperience;
        var rideCategory     = req.body.rideCategory;
        var locationCity     = req.body.locationCity;
        var locationZipcode  = req.body.locationZipcode;
        var locationState    = req.body.locationState;
        var locationCountry  = req.body.locationCountry;
        var locationLat      = req.body.locationLat;
        var locationLng      = req.body.locationLng;
        var fcmToken         = req.body.fcmToken;
      
      
    console.log('case 1 email: '+email);
     
     if(email != "" && email != undefined){
        User.findOne({ 'local.email' :  { $regex : new RegExp(email, "i") } }, function(err, user) {
            // if there are any errors, return the error
            if (err) {
                console.log("error caught 1");
                res.json({ 
                    success: false, 
                    data: null, 
                    message: err, 
                    code: 400
                });
            }
            else{
                
                if(user){   // if user exist with that email
                User.update({ 
                                'local.email': { $regex : new RegExp(email, "i") } 
                            },
                            { 
                                $set:   { 
                                            'local.profileImage'   : profileImage ,
                                            'local.username'       :username,
                                            'facebook.id'          : facebook_id,
                                            'local.contact'        : contact ,
                                            'rideType'             :rideType,
                                            'rideExperience'       : rideExperience,
                                            'rideCategory'         : rideCategory,
                                            'local.locationCity'   : locationCity,
                                            'local.locationZipcode': locationZipcode,
                                            'local.locationState'  : locationState,
                                            'local.locationCountry': locationCountry,
                                            'local.locationLat'    : locationLat,
                                            'local.locationLng'    : locationLng,
                                            'fcmToken'             : fcmToken
                                        } 
                            },
                            { multi: true },
                function(err, userinfo){

                     if (err){
                        console.log("error caught 3");
                        res.json({ 
                            success: false, 
                            data: null, 
                            message: err, 
                            code: 400
                        });
                    }else{
                        
                        console.log('case 2 email: '+email);
                        
                        res.json({ 
                            success: true,
                            data: 
                                {
                                    username         :username,
                                    email            :email,
                                    profilepic       :profileImage,
                                    contact          :contact,
                                    rideType         :rideType,
                                    rideExperience   :rideExperience,
                                    rideCategory     :rideCategory,
                                    locationCity     :locationCity,
                                    locationZipcode  :locationZipcode,
                                    locationState    :locationState,
                                    locationCountry  :locationCountry,
                                    locationLat      :locationLat,
                                    locationLng      :locationLng,
                                    rproputeInviteLink:globalConfig.websiteUrl+"/invite/"+user.local.username,
                                    fcmToken         :fcmToken
                                    
                                   
                                },
                            message: globalConfig.successUpdate, 
                            code: 200
                        });
                    }
                });    

                }
                else{ 
                // if there is no user with that email
                // create the user
                var newUser                     = new User();
                newUser.local.username          = username;
                newUser.local.email             = email;
                newUser.local.userLevel         = 'NORMAL';    //default to NORMAL
                newUser.local.userActive        = 'ACTIVE';    //default to ACTIVE
                newUser.local.token             = globalConfig.randomString;
                newUser.local.profileImage      = profileImage;
                newUser.facebook.id             = facebook_id;
                newUser.local.contact           = contact;
                newUser.rideType                = rideType;
                newUser.rideExperience          = rideExperience;
                newUser.rideCategory            = rideCategory;
                newUser.local.locationCity      = locationCity;
                newUser.local.locationZipcode   = locationZipcode;
                newUser.local.locationState     = locationState;
                newUser.local.locationCountry   = locationCountry;
                newUser.local.locationLat       = locationLat;
                newUser.local.locationLng       = locationLng;
                newUser.fcmToken                = fcmToken;
        	// save the user
                newUser.save(function(err){
                    if (err){
                        console.log("error caught 3");
                        res.json({ 
                            success: false, 
                            data: null, 
                            message: err, 
                            code: 400
                        });
                    }else{
                        
                        console.log('case 3 email: '+email);
                        
                        res.json({ 
                            success: true,
                            data: 
                                {
                                    username         :username,
                                    email            :email,
                                    profilepic       :profileImage,
                                    contact          :contact,
                                    rideType         :rideType,
                                    rideExperience   :rideExperience,
                                    rideCategory     :rideCategory,
                                    locationCity     :locationCity,
                                    locationZipcode  :locationZipcode,
                                    locationState    :locationState,
                                    locationCountry  :locationCountry,
                                    locationLat      :locationLat,
                                    locationLng      :locationLng,
                                    rproputeInviteLink:globalConfig.websiteUrl+"/invite/"+username,
                                    fcmToken         :fcmToken
                                   
                                },
                            message: globalConfig.successRegister, 
                            code: 200
                        });
                    }
                });
            }   
        }
    });
    }else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
    
});


/* API endpoint to be used by mobile device for rproutes  */
router.post('/start-route', function (req, res) {
        

        
        console.log("******* start rproutes*********");
       //res.send(true);
       
        
        var lastModifiedDate  = Date.now();
        
        var email                  = req.body.email;
        var currentlocationLat     = req.body.currentlocationLat;
        var currentlocationLng     = req.body.currentlocationLng;
        
//        var email                  = 'preeti_dev@rvtechnologies.co.in';
//        var currentlocationLat     = '40';
//        var currentlocationLng     = '-73';
        var locationarray = [];
        locationarray.push(parseFloat(currentlocationLng));
        locationarray.push(parseFloat(currentlocationLat));
        console.log(locationarray);
        
        if(email != "" && email != undefined){
           
        RpRoutes.findOne({$and : [{ $or : [ { 'isRouteCompleted' : 'CREATED' }, { 'isRouteCompleted' : 'ONGOING'} ] },{ $or : [ { email : { $regex : new RegExp(email, "i")}}]}]}, function(err, getrproutes){
          //RpRoutes.findOne({ 'email' :  { $regex : new RegExp(email, "i") },'isRouteCompleted': 'CREATED' }, function(err, getrproutes) {
            // if there are any errors, return the error
            if (err) {
                    console.log("route error caught 1");
                    res.json({ 
                        success: false, 
                        data: null, 
                        message: err, 
                        code: 400
                    });
                }
            else {
                 
                if(getrproutes){   // if user exist with that email
                    var route = getrproutes.route;
                    console.log("starting location : "+getrproutes.startinglocationLat);
                    var currentlat = currentlocationLat;
                    var startlat = getrproutes.startinglocationLat;
                    var currentlon = currentlocationLng;
                    var startlon = getrproutes.startinglocationLng;
                    
                    //function to calculate distance remaining to check whether route is completed or not
                    if(getrproutes.isRouteCompleted == "CREATED"){
                    var distanceStarted = RouteFunction.calculateDistance(startlat,startlon,currentlat,currentlon);
                    } 
                    else{
                    var distanceStarted = RouteFunction.calculateDistance(getrproutes.currentlocationLat,getrproutes.currentlocationLng,currentlat,currentlon);
                    }
                    var distInmeters = distanceStarted * 1000;  // distance in meters
                    var roundDist = Math.round(distInmeters);

                    if(roundDist <= globalConfig.nearbyDistance ){
                       
                    console.log("round distance****"+roundDist);
                
                RpRoutes.update({ 
                                'email': { $regex : new RegExp(email, "i") } 
                            },
                            { 
                                $set:   { 
                                            'currentlocationLat': currentlocationLat,
                                            'currentlocationLng': currentlocationLng ,
                                            'activeStatus':'ACTIVE',
                                            'isRouteCompleted': 'ONGOING',
                                            'lastModifiedDate': lastModifiedDate,
                                            'location': locationarray,
                                        } 
                            },
                            { multi: true },
                function(err, rprouteinfo){

                     if (err){
                        console.log("route error caught 3");
                        res.json({ 
                            success: false, 
                            data: null, 
                            message: err, 
                            code: 400
                        });
                    }else{
                           
                            res.json({ 
                                success: true,
                                data: 
                                    {

                                        email       :email,
                                        route       :getrproutes.route,
                                        isRouteCompleted :'ONGOING',

                                    },
                                message: globalConfig.successUpdate, 
                                code: 200
                            });
                    }
                });   
                }else{
                            res.json({ 
                            success: true,
                            data: null,
                            message: "You can start route nearby "+globalConfig.nearbyDistance+" location", 
                            code: 200
                        });
                    }

                }
                else{ 
                    res.json({ 
                        success: false, 
                        data: null, 
                        message: "Route not found", 
                        code: 400
                    });
                
                } 
                
                }
           
            });
          
       }
    else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
       
});

/* API stop endpoint to be used by mobile device for rproutes  */
router.post('/stop-route', function (req, res) {
        
       
        console.log("******* stop rproutes*********");
       //res.send(true);
       
        var isRouteCompleted  = 'ONGOING';
        var lastModifiedDate  = Date.now();
        
        var email                  = req.body.email;
        var currentlocationLat     = req.body.currentlocationLat;
        var currentlocationLng     = req.body.currentlocationLng;

        //var email                  = 'preeti_dev@rvtechnologies.co.in';
        //var currentlocationLat     = '1.2393';
        //var currentlocationLng     = '1.8184';
        var locationarray = [];
        locationarray.push(parseFloat(currentlocationLng));
        locationarray.push(parseFloat(currentlocationLat));
        console.log(locationarray);

        
        if(email != "" && email != undefined){
           
            RpRoutes.findOne({ 'email' :  { $regex : new RegExp(email, "i") },'isRouteCompleted': 'ONGOING' }, function(err, getrproutes) {
            // if there are any errors, return the error
            if (err) {
                    console.log("route error caught 1");
                    res.json({ 
                        success: false, 
                        data: null, 
                        message: err, 
                        code: 400
                    });
                }
            else {
                 
                if(getrproutes){   // if user exist with that email

                    
                        var route = getrproutes.route;
                        var points = getrproutes.points;
                        var numberOfSubRoutesCompleted = 0;
                        var currentlat = currentlocationLat;
                        var endlat = getrproutes.endinglocationLat;
                        var currentlon = currentlocationLng;
                        var endlon = getrproutes.endinglocationLng;
                        var startLat = getrproutes.startinglocationLat;
                        var startLng= getrproutes.startinglocationLng;
                       
                        //function to calculate distance remaining to check whether route is completed or not
                        var distanceRemaining = RouteFunction.calculateDistance(currentlat,currentlon,endlat,endlon);
                        // To calculate completed distance till now to calculate  points
                        var distanceCompleted = RouteFunction.calculateDistance(startLat,startLng,currentlat,currentlon);
                        console.log("distanceRemaining : "+distanceRemaining);
                       
                        var distInmeters = distanceRemaining * 1000;  // distance in meters
                        var roundDist = Math.round(distInmeters);
                        
                        console.log("distInmeters : "+distInmeters);
                        console.log("roundDist : "+roundDist);
                        
                        var jsonRoute =   RouteFunction.jsonRoutePoints(route);  // call function to get route points
                        var pointsperkm = jsonRoute.routes.pointsPerKm;   // get points per km according to route
                        points += distanceCompleted  * pointsperkm;
                        
                        if(roundDist <= globalConfig.nearbyDistance ){
                            console.log("completed");
                            isRouteCompleted = "COMPLETED";
                            var bonuspoints = jsonRoute.routes.bonusPoints;   // get bonus points according to route
                            points += bonuspoints;
                            
                           // RouteFunction.updateRouteTools(email,'addHelmets',route);
                        }
                        else{
                            console.log("ongoing");
                            isRouteCompleted = "ONGOING";
                        }
                        
                        /* conditions to check which subroute is completed */
                        if(Math.round(distanceCompleted) == jsonRoute.routes.distanceSubRoute1 && route <= 7){
                            numberOfSubRoutesCompleted = 1;
                            RouteFunction.updateRouteTools(email,'addHelmets',route);
                        }
                        if(Math.round(distanceCompleted) == jsonRoute.routes.distanceSubRoute2 && route <= 7){
                            numberOfSubRoutesCompleted = 2;
                            RouteFunction.updateRouteTools(email,'addHelmets',route);
                        }
                        if(Math.round(distanceCompleted) == jsonRoute.routes.distanceSubRoute3 && route <= 7){
                            numberOfSubRoutesCompleted = 3;
                            RouteFunction.updateRouteTools(email,'addHelmets',route);
                        }
                        if(Math.round(distanceCompleted) == jsonRoute.routes.distanceSubRoute1 && route >= 8 && route <= 10){
                            numberOfSubRoutesCompleted = 1;
                            RouteFunction.updateRouteTools(email,'addHelmets',route);
                        }
                    
                    
                    
                console.log("round distance****"+roundDist);
                RpRoutes.update({ 
                                'email': { $regex : new RegExp(email, "i") } 
                            },
                            { 
                                $set:   { 
                                            'currentlocationLat': currentlocationLat,
                                            'currentlocationLng': currentlocationLng ,
                                            'activeStatus':'ACTIVE',
                                            'isRouteCompleted': isRouteCompleted,
                                            'lastModifiedDate': lastModifiedDate,
                                            'location': locationarray,
                                        } 
                            },
                            { multi: true },
                function(err, rprouteinfo){

                     if (err){
                        console.log("route error caught 3");
                        res.json({ 
                            success: false, 
                            data: null, 
                            message: err, 
                            code: 400
                        });
                    }else{
                        
                        
                        res.json({ 
                            success: true,
                            data: 
                                {
                                   
                                    email       :email,
                                    route       :getrproutes.route,
                                    isRouteCompleted :isRouteCompleted
                                   
                                },
                            message: globalConfig.successUpdate, 
                            code: 200
                        });
                    }
                });    

                }
                else{ 
                    res.json({ 
                            success: false, 
                            data: null, 
                            message: "Ongoing Route not found", 
                            code: 400
                        });
                
                } 
                
            }
           
        });
          
       }
    else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
       
});

/* API end point to create event for mobile users */
router.post('/create-event', function (req, res) {
        
//        var email          = "preeti_dev@rvtechnologies.co.in";
//        var eventName      = "test";
//        var eventType      = "toy run type";
//        var start          = "2017-03-13 06:00";
//        var end            = "2017-03-13 09:00";
//        var location       = "chandigarh";
//        var host           = "test user";
        
        var email          = req.body.email;
        var eventName      = req.body.eventName;
        var eventType      = req.body.eventType;
        var startDate      = req.body.startDate;
        var endDate        = req.body.endDate;
        var location       = req.body.location;
        var host           = req.body.host;
        var description    = req.body.description;
        var imagePath      = req.body.imagePath;
        var startTime      = req.body.startTime;
        var endTime        = req.body.endTime;
        var locationLat    = req.body.locationLat;
        var locationLong    = req.body.locationLong;
      
      
      
    console.log('case 1 email: '+email);
    console.log('startDate: '+startDate);
    console.log('endDate: '+endDate);
    console.log('startTime: '+startTime);
    console.log('endTime: '+endTime);
     
    if(email != "" && email != undefined){
       
                var objEvents           = new Events();
                objEvents.eventName     = eventName;
                objEvents.eventType     = eventType;
                objEvents.eventLocation = location;
                objEvents.eventHost     = host;
                objEvents.startDate     = startDate;
                objEvents.endDate       = endDate;
                objEvents.userEmail     = email;
                objEvents.description   = description;
                objEvents.eventImage    = imagePath;
                objEvents.startTime     = startTime;
                objEvents.endTime       = endTime;
                objEvents.eventlocationLat  = locationLat;
                objEvents.eventlocationLong = locationLong;
       
                objEvents.save(function (err,eventinfo) {
                    if (err){
                        console.log("error caught 3");
                        res.json({ 
                            success: false, 
                            data: null, 
                            message: err, 
                            code: 400
                        });
                    }else{
                        
                        console.log('case 2 email: '+email);
                        
                        res.json({ 
                            success: true,
                            data: 
                                {
                                    
                                    eventName       :eventName,
                                    eventType       :eventType,
                                    eventLocation   :location,
                                    locationlat     :locationLat,
                                    locationlong    :locationLong,
                                    eventHost       :host,
                                    startDate       :startDate,
                                    endDate         :endDate,
                                    eventDescription:description,
                                    userEmail       :email,
                                    image           :imagePath,
                                    startTime       :startTime,
                                    endTime         :endTime,
                                      
                                },
                            message: "success", 
                            code: 200
                        });
                    }
                });
    }else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
    
});


/* API end point to update event for mobile users */
router.post('/update-event', function (req, res) {
        
//        var email          = "preeti_dev@rvtechnologies.co.in";
//        var eventName      = "test";
//        var eventType      = "toy run type";
//        var start          = "2017-03-13 06:00";
//        var end            = "2017-03-13 09:00";
//        var location       = "chandigarh";
//        var host           = "test user";
        var eventId        = req.body.eventId;
        var eventName      = req.body.eventName;
        var eventType      = req.body.eventType;
        var startDate      = req.body.startDate;
        var endDate        = req.body.endDate;
        var location       = req.body.location;
        var host           = req.body.host;
        var description    = req.body.description;
        var imagePath      = req.body.imagePath;
        var startTime      = req.body.startTime;
        var endTime        = req.body.endTime;
        var locationLat    = req.body.locationLat;
        var locationLong    = req.body.locationLong;
      
      
    console.log('case 1 eventId: '+eventId);
     
    if(eventId != "" && eventId != undefined){
           
            Events.findOne({ _id: eventId } ,function(err, event){
                if(err){
                    res.json({ 
                                success: false, 
                                data: null, 
                                message: "Event not found", 
                                code: 400
                    });
                }
                else{
                    
                Events.update({   '_id':eventId },
                            { 
                                $set:   { 

                                            'eventName'    : eventName,
                                            'eventType'    : eventType ,
                                            'eventLocation': location,
                                            'eventlocationLat' : locationLat,
                                            'eventlocationLong' : locationLong,
                                            'eventHost'    : host,
                                            'startDate'    : startDate,
                                            'endDate'      : endDate,
                                            'description'  : description,
                                            'email'        : event.email,
                                            'eventImage'   : imagePath,
                                            'startTime'    : startTime,
                                            'endTime'      : endTime
                                        } 
                            },
                            { multi: true },
                function(err, eventinfo){

                     if (err){
                        console.log("route error caught 3");
                        res.json({ 
                            success: false, 
                            data: null, 
                            message: err, 
                            code: 400
                        });
                    }else{
                        
                        
                        res.json({ 
                            success: true,
                            data: 
                                {
                                   
                                    email         : event.email,
                                    eventName     : eventName,
                                    eventType     : eventType,
                                    eventLocation : location,
                                    locationLat   : locationLat,
                                    locationLong  : locationLong,
                                    eventHost     : host,
                                    startDate     : startDate,
                                    endDate       : endDate,
                                    description   : description,
                                    email         : event.email,
                                    eventImage    : imagePath,
                                    startTime     : startTime,
                                    endTime       : endTime
                                   
                                },
                            message: "success", 
                            code: 200
                        });
                    }
                }); 
            }
        });
    }else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
    
});

/* API end point to delete event for mobile users */
router.post('/delete-event', function (req, res) {
        

    var eventId        = req.body.eventId;
       
    if(eventId != "" && eventId != undefined){
       
        Events.findOne({ _id: eventId } ,function(err, event){
                if(err){
                    res.json({ 
                                success: false, 
                                data: null, 
                                message: "Event not found", 
                                code: 400
                    });
                }
                else{  
                    Events.remove({ _id: eventId } ,function(err, status){

                        if(err){
                               res.json({ 
                                success: false, 
                                data: null, 
                                message: err, 
                                code: 400
                            });
                        }
                        else{
                              res.json({ 
                                success: true,
                                data: null,
                                message: "Event deleted successfully!", 
                                code: 200
                            });
                        }

                    });
                }
            });    
                
    }else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
    
});


/* API end point to list events for mobile users */
router.post('/list-events', function (req, res) {
     //var email = 'admin@gmail.com'; 
    var email  = req.body.email;
       
    if(email != "" && email != undefined){
        Events.find({  'userEmail': { $regex : new RegExp(email, "i") }},function (err, eventsList) {
            if(!err){
                
                res.json({ 
                                success: true,
                                data: eventsList,
                                message: "Event listed successfully!", 
                                code: 200
                        });
            }
            else{
                
               res.json({ 
                                success: true,
                                data: null,
                                message:err, 
                                code: 400
                        });
                
            }
        });   
    }else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
    
});

/* API end point to search events for mobile users */
router.post('/search-events', function (req, res) {
    var searchterm  = req.body.searchterm;  
    var email  = req.body.email;
    var searchType = req.body.searchType;
    
    
    if(searchterm != "" && searchterm != undefined  && email != "" && email != undefined){
    if(searchType == '0'){      // search only users events
        Events.find({ $and: [{ 'userEmail': { $regex : new RegExp(email, "i")} }],$or :[{ 'eventName': new RegExp(searchterm, 'i') }, 
                    {'eventType': new RegExp(searchterm, 'i')},
                    {'eventLocation': new RegExp(searchterm, 'i')},
                    {'eventHost': new RegExp(searchterm, 'i')},

                   ]}, function(err, eventsList){

                  // Events.find({  'userEmail': { $regex : new RegExp(email, "i") }},function (err, eventsList) {
                       if(!err){

                           res.json({ 
                                           success: true,
                                           data: eventsList,
                                           message: "Events searched successfully!", 
                                           code: 200
                                   });
                       }
                       else{

                          res.json({ 
                                           success: true,
                                           data: null,
                                           message:err, 
                                           code: 400
                                   });

                       }
        });   
    }else if(searchType == '1'){   // search all events
        
        Events.find({ $or :[{ 'eventName': new RegExp(searchterm, 'i') }, 
                    {'eventType': new RegExp(searchterm, 'i')},
                    {'eventLocation': new RegExp(searchterm, 'i')},
                    {'eventHost': new RegExp(searchterm, 'i')},

                   ]}, function(err, eventsList){

                  // Events.find({  'userEmail': { $regex : new RegExp(email, "i") }},function (err, eventsList) {
                       if(!err){

                           res.json({ 
                                           success: true,
                                           data: eventsList,
                                           message: "Events searched successfully!", 
                                           code: 200
                                   });
                       }
                       else{

                          res.json({ 
                                           success: true,
                                           data: null,
                                           message:err, 
                                           code: 400
                                   });

                       }
        });   
        
    }
                
    }else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
    
});


/* API end point to list events for mobile users */
router.post('/list-all-events', function (req, res) {
   
        Events.find({},function (err, eventsList) {
            if(!err){
                
                res.json({ 
                                success: true,
                                data: eventsList,
                                message: "Event listed successfully!", 
                                code: 200
                        });
            }
            else{
                
               res.json({ 
                                success: true,
                                data: null,
                                message:err, 
                                code: 400
                        });
                
            }
        });   
      
});

/*
 * Api route to join event
 */
router.post('/join-event', function (req, res){
    
   var eventId = req.body.eventId;
   var email   = req.body.email;
   console.log("email : "+email);
   console.log("eventId : "+eventId);
   if(eventId != "" && eventId != undefined && email != "" && email != undefined ){
    User.findOne({'local.email': { $regex : new RegExp(email, "i") }}, function (err, userdata) {          
    Events.findOne({'_id':eventId}, function (err, eventsdata) {      
        Joinevents.findOne({'userEmail': email,'eventId':eventId}, function (err, joineventsdata) {
            if (!joineventsdata) {
                
                var objJoinEvents           = new Joinevents();
                objJoinEvents.eventId       = eventId;
                objJoinEvents.userEmail     = email;
                objJoinEvents.joined        = 1;
              

                objJoinEvents.save(function (err) {
                if(err){
                       res.json({ 
                                success: true,
                                data: null,
                                message:err, 
                                code: 400
                        });
                }
                else{
                        var starteventDate = moment(eventsdata.startDate).format('YYYY-MM-DD');
                        var endeventDate = moment(eventsdata.endDate).format('YYYY-MM-DD');
                        var starttime = starteventDate+' '+eventsdata.startTime;
                        var endtime = endeventDate+' '+eventsdata.endTime;
                          
                        var html = 'Hello,<br>You are successfully registered to the event.<br><br><b>Event Title : </b>'+eventsdata.eventName+'<br><b>Host by : </b>'+eventsdata.eventHost+'<br><b>Started on : </b>'+starttime+'<br><b>Ended on : </b>'+endtime+'<br><b>Venue Location : </b>'+eventsdata.eventLocation+'<br><br>';
                            html += '<br>Thank you, Team Motorcycle';
                
                        var mailOptions = {
                            from   : "Motorcycle <no-reply@motorcycle.com>", 
                            to     :  email,
                            subject: "Join Events",
                            html   : html
                        };
                        
                        
                        var htmladmin = 'Hello,<br>'+userdata.local.username+' joined this event.<br><br><b>Event Title : </b>'+eventsdata.eventName+'<br><b>Host by : </b>'+eventsdata.eventHost+'<br><b>Started on : </b>'+starttime+'<br><b>Ended on : </b>'+endtime+'<br><b>Venue Location : </b>'+eventsdata.eventLocation+'<br><br>';
                            htmladmin += '<br>Thank you, Team Motorcycle';
                
                        var mailOptionsadmin = {
                            from   : "Motorcycle <no-reply@motorcycle.com>", 
                            to     :  eventsdata.userEmail,
                            subject: "Join Events",
                            html   : htmladmin
                        };

                        nodemailer.mail(mailOptions);
                        nodemailer.mail(mailOptionsadmin);
                        
                        res.json({ 
                                success: true,
                               data: 
                                {
                                    email         : email,
                                    eventName     : eventsdata.eventName,
                                   
                                },
                                message: "Event joined successfully!", 
                                code: 200
                        });
                        
                }
                
                
                });
            }else{
                res.json({ 
                                success: true,
                                data: 
                                {
                                    email         : email,
                                    eventName     : eventsdata.eventName,
                                   
                                },
                                message:"Event already joined!",  
                                code: 200
                });
                
            }
        });
    });
    });
       
   }else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
   }
           
    
});

/* API end point to settings for mobile users */
router.post('/settings', function(req, res){
    
    var email                = req.body.email;

    console.log('*** email: '+email);
    
    if(email != "" && email != undefined){
        User.findOne({ 'local.email' :  { $regex : new RegExp(email, "i") } }, function(err, user) {
            // if there are any errors, return the error
            if (err) {
                console.log("error caught 1");
                res.json({ 
                    success: false, 
                    data: null, 
                    message: err, 
                    code: 400
                });
            }
            // check to see if theres already a user with that email
            if (user) {
               
                if(req.body.rideVisibility){
                    user.rideSettings.rideVisibility        = req.body.rideVisibility;
                }
                if(req.body.rideShowDistance){
                    user.ridePrivacy.rideShowDistance       = req.body.rideShowDistance;
                }
                if(req.body.rideShowOnline){
                    user.ridePrivacy.rideShowOnline         = req.body.rideShowOnline;
                }
                if(req.body.ridePublicSearch){
                    user.ridePrivacy.ridePublicSearch       = req.body.ridePublicSearch;
                }
                if(req.body.rideMessage){
                    user.rideNotification.rideMessage       = req.body.rideMessage;
                }
                if(req.body.rideBumped){
                    user.rideNotification.rideBumped        = req.body.rideBumped;
                }
                if(req.body.rideAlerts){
                    user.rideNotification.rideAlerts        = req.body.rideAlerts;
                }
                if(req.body.rideContestNews){
                    user.rideNews.rideContestNews           = req.body.rideContestNews;
                }
                
              
                
        	// save the user
                user.save(function(err,updateuser){
                    if (err){
                        console.log("error caught 3");
                        res.json({ 
                            success: false, 
                            data: null, 
                            message: err, 
                            code: 400
                        });
                    }else{
                        res.json({ 
                            success: true,
                            data: 
                                {
                                    email                :req.body.email,
                                    rideVisibility       :updateuser.rideSettings.rideVisibility,
                                    rideShowDistance     :updateuser.ridePrivacy.rideShowDistance,
                                    rideShowOnline       :updateuser.ridePrivacy.rideShowOnline,
                                    ridePublicSearch     :updateuser.ridePrivacy.ridePublicSearch,
                                    rideMessage          :updateuser.rideNotification.rideMessage,
                                    rideBumped           :updateuser.rideNotification.rideBumped,
                                    rideAlerts           :updateuser.rideNotification.rideAlerts,
                                    rideContestNews      :updateuser.rideNews.rideContestNews,
                                   
                                },
                            message: "settings updated", 
                            code: 200
                        });
                    }
                });
               
            }
        });
    }else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
});


/* API stop endpoint to be used by mobile device for rproutes  */
router.post('/nearby-riders', function (req, res) {
   
    var email               = req.body.email;
    var currentlocationLat  = req.body.currentlocationLat;
    var currentlocationLng  = req.body.currentlocationLng;
    
//    var email               = 'preeti_dev@rvtechnologies.co.in';
//    var currentlocationLat  = 40.74;
//    var currentlocationLng  = -74;
      var parseCurrentlocationLng = parseFloat(currentlocationLng);
      var parseCurrentlocationLat = parseFloat(currentlocationLat);

    console.log("parseCurrentlocationLng ****** "+parseCurrentlocationLng);
    console.log("parseCurrentlocationLat ****** "+parseCurrentlocationLat);
    var jsonarray = [];
   
   
    if(email != "" && email != undefined && currentlocationLat != "" && currentlocationLat != undefined && currentlocationLng != "" && currentlocationLng != undefined){
    
         RpRoutes.aggregate(
        [

            {
                        $lookup:
                                {
                                    from: "users",
                                    localField: "email",
                                    foreignField: "local.email",
                                    as: "item"
                        }
            },
            
            { "$unwind": "$item" },
            
            {
                        $project:
                                {
                                     "rideVisibility": "$item.rideSettings.rideVisibility",
                                     "FirstName": "$item.local.firstName",
                                     "LastName": "$item.local.lastName",
                                     "LastName": "$item.local.lastName",
                                     "email"   : "$item.local.email",
                                     "profileimage" :"$item.local.profileImage",
                                     "username" :"$item.local.username",
                                     "location":1
                                          
                                }
            }, 
            
            {
                   $match:{
                   location: 
                            { $geoWithin: 
                                { $centerSphere: [ [ parseCurrentlocationLng, parseCurrentlocationLat ], (200 / 6378.1)   ] 
                        } 
                    },rideVisibility:1}  
            },
           
            
        ]
        ,function (err, getrproutes) {
            console.log(getrproutes);
        if(getrproutes){
            res.json({
                success: true, 
                data: {
                    users : getrproutes
                },
                message: "success", 
                code: 200
            });
        }else{
            res.json({ 
                    success: true,
                    data: null,
                    message: "No riders nearby 25km radius", 
                    code: 200
            });
        }
    });
    
    
    }
    else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
    
});

/* API route to accept friend request */
router.post('/respond-friend-request', function (req, res) {
    var friendRequestBy = req.body.friendRequestBy; //email
    var friendRequestTo = req.body.friendRequestTo; //email
    var friendRequestRespond = req.body.friendRequestRespond;

    if ((friendRequestBy !== undefined && friendRequestBy !== null) && (friendRequestTo !== undefined && friendRequestTo !== null)) {
        User.findOne({'local.email': friendRequestBy}, function (err, userdata) {
        friends.findOne({'friendRequestSentBy': friendRequestBy, 'friendRequestSentTo': friendRequestTo,'friendRequestApprovalStatus':'pending'}, function (err, friendReq) {
            if (err) {
                res.json(false);
            } else {
                if(friendRequestRespond == 'accept'){
                        friendReq.friendRequestApprovalStatus = 'accept';
                        friendReq.save(function (err) {
                            if (!err) {
                                var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                                    to: userdata.fcmToken, 

                                    notification: {
                                        title: 'Accept', 
                                        body: userdata.local.firstName+" "+userdata.local.lastName+" accepted your friend request." 
                                    },

                                };

                                fcm.send(message, function(err, response){
                                    if (err) {
                                        console.log("Something has gone wrong!");
                                            res.json({ 
                                                success: false, 
                                                data: null, 
                                                message: "error occured : "+err, 
                                                code: 400
                                            });
                                    } else {
                                        console.log("Notification Successfully sent with response: ", response);
                                                            res.json({ 
                                                                    success: true, 
                                                                    data: {
                                                                        friendRequestSentBy : friendRequestBy,
                                                                        friendRequestSentTo: friendRequestTo,
                                                                        friendRequestStatus: friendReq.friendRequestApprovalStatus,
                                                                        name:userdata.local.firstName+" "+userdata.local.lastName,
                                                                             
                                                                    }, 
                                                                    message: "friend request accepted", 
                                                                    code: 400
                                                                });
                                    }

                                });
                               
                            } else {
                                res.json({ 
                                    success: false, 
                                    data: null, 
                                    message: "error occured : "+err, 
                                    code: 400
                                });
                            }
                        });
                }
                else if(friendRequestRespond == 'reject'){
                    friends.remove({'friendRequestSentBy': friendRequestBy, 'friendRequestSentTo': friendRequestTo,'friendRequestApprovalStatus':'pending'}, function (err, friendReq) {
                        if(err){
                                res.json({ 
                                    success: false, 
                                    data: null, 
                                    message: "error occured : "+err, 
                                    code: 400
                                });
                            
                        }else{
                            res.json({ 
                                    success: true, 
                                    data: {
                                        friendRequestSentBy : friendRequestBy,
                                        friendRequestSentTo: friendRequestTo,
                                        friendRequestStatus: 'rejected'
                                    }, 
                                    message: "friend request rejected", 
                                    code: 400
                            });
                        }
                    });
                }
            }
        });
    });
    }
});

/*
 * Api route to get friend request lists for mobile
 */
router.post('/get-friendrequests-list', function(req, res){
   
    var email = req.body.email;
    //var email = "tester@rvtech.com";
    if(email != "" && email != undefined){
      friends.aggregate(
        [

            {
                        $lookup:
                                {
                                    from: "users",
                                    localField: "friendRequestSentBy",
                                    foreignField: "local.email",
                                    as: "item"
                        }
            },
            
            { "$unwind": "$item" },
            
            {
                        $project:
                                {
                                     "FirstName": "$item.local.firstName",
                                     "LastName": "$item.local.lastName",
                                     "LastName": "$item.local.lastName",
                                     "email"   : "$item.local.email",
                                     "profileimage" :"$item.local.profileImage",
                                     "username" :"$item.local.username",
                                     "friendRequestSentTo":1,
                                     "friendRequestApprovalStatus":1,
                                     "friendRequestSentBy":1
                                         
                                }
            }, 
            
            {
                   $match:{'friendRequestSentTo' : email , 'friendRequestApprovalStatus':'pending'} 
            },
            
        ]
        ,function (err, friendsdata) {
        if(friendsdata){
            res.json({
                success: true, 
                data: {
                    requestlist : friendsdata
                },
                message: "success", 
                code: 200
            });
        }else{
            res.json({ 
                    success: true,
                    data: null,
                    message: "request list empty", 
                    code: 200
            });
        }
    });
   
    
    }
    else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
        
    }

});

//router.post('/push-notification', function(req, res){
//    
//    //return res.json({'msg': 'my msg'});
//    
//    var FCM = require('fcm-node');
//
//    var serverKey = 'AAAAFYFV6mc:APA91bFB4RWwB7eaQL_AsyFvg1Dy_TWP-S4g9tWmn5XsaCcS-vR_MNMZbAjsHtziRxNtIZKHBF9bTFWOtvLhdXDJFjppLWf0_tYaktvMEuNzTciCUTpD8qTWuKee5bID0EP4pUo-EFuE';
//    var fcm = new FCM(serverKey);
//
//    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
//        to: 'fIIAKgKHpqk:APA91bF2pHQAZ1LkRJ9gD8YfoR0mv4QFqaaexPsBuFpVBnnZlU94Uhk_r1kFTambf1dIQTYfkdX8sMkWrC7ToDSvmKax0PI4XDV-ZAiksLUoNyDafxXmMD8bAWAJwNYdFQ2N_mie4kLn', 
//        //collapse_key: 'your_collapse_key',
//
//        notification: {
//            title: 'Request', 
//            body: 'User A sent you a friend request.' 
//        },
//
//    };
//
//    fcm.send(message, function(err, response){
//        if (err) {
//            console.log("Something has gone wrong!");
//            return res.json(err);
//        } else {
//            console.log("Successfully sent with response: ", response);
//            return res.json(response);
//        }
//        
//    });
//});
/*
 * Api route to  show friends list for logged in user
 */
router.post('/get-friends-list', function(req, res){
     
    var email = req.body.email;
    //var email = "preeti_dev@rvtechnologies.co.in";
    
    if(email != "" && email != undefined){
    friends.aggregate(
        [
            {
                   $match:{$and : [{ $or : [ { 'friendRequestSentTo' : email }, { 'friendRequestSentBy' : email} ] },{ $or : [ { 'friendRequestApprovalStatus' : 'accept'}]}]}  
            },
            
            {          
                        $lookup:
                                {
                                    from: "users",
                                    localField: "friendRequestSentTo",
                                    foreignField: "local.email",
                                    as: "item1"
                        }
            },
            {          
                        $lookup:
                                {
                                    from: "users",
                                    localField: "friendRequestSentBy",
                                    foreignField: "local.email",
                                    as: "item2"
                        }
            },
            
            { "$unwind": "$item1" },
            { "$unwind": "$item2" },
            
            {
                        $project:
                                { 
                                     "FirstName":  { $cond: [  { $eq : [ email, "$friendRequestSentTo" ] }, "$item2.local.firstName", "$item1.local.firstName" ]},
                                     "LastName": { $cond: [ { $eq : [ email, "$friendRequestSentTo" ] }, "$item2.local.lastName", "$item1.local.lastName" ]},
                                     "profileImage": { $cond: [ { $eq : [ email, "$friendRequestSentTo" ] }, "$item2.local.profileImage", "$item1.local.profileImage" ]},
                                     "friendRequestSentTo": 1,
                                     "friendRequestSentBy": 1,
                                }
            } 
            
        ]
        ,function (err, friendsdata) {
        if(!err){
            res.json({
                success: true, 
                data: {
                    friendsdata : friendsdata
                },
                message: "success", 
                code: 200
            });
        }else{
            res.json({
                success: false, 
                data: null,
                message: "error", 
                code: 400
            });
        }
    });
    
    }
    else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }

});

/*
 * Api route to send location and calculate points
 */
router.post('/send-location', function(req, res){
//    var route               = 1;
        var email               = req.body.email;
        var currentLocationLat  = req.body.currentLocationLat;
        var currentLocationLong = req.body.currentLocationLong;
        
//        var email                  = 'preeti_dev@rvtechnologies.co.in';
//        var currentLocationLat     = '40';
//        var currentLocationLong     = '-73';
        var locationarray = [];
        locationarray.push(parseFloat(currentLocationLat));
        locationarray.push(parseFloat(currentLocationLong));
        
       
        var isRouteCompleted = "ONGOING";
        /* Find ongoing route of user */
        if(email != "" && email != undefined){
        RpRoutes.findOne({$and : [{ $or : [ { 'isRouteCompleted' : 'CREATED' }, { 'isRouteCompleted' : 'ONGOING'} ] },{ $or : [ { email : { $regex : new RegExp(email, "i")}}]}]}, function(err, getrproutes){
                    if(!getrproutes){
                        console.log("route error caught 1");
                                res.json({ 
                                    success: true, 
                                    data: null, 
                                    message: "No ongoing route", 
                                    code: 200
                                });
                       
                    }
                    else{
                        
                       var route = getrproutes.route;
                       var points = getrproutes.points;
                       var numberOfSubRoutesCompleted = 0;
                       var startinglocationLat = getrproutes.startinglocationLat;
                       var startinglocationLng = getrproutes.startinglocationLng;
                       var endinglocationLat   = getrproutes.endinglocationLat;
                       var endinglocationLng   = getrproutes.endinglocationLng;
                       var lastCurrentLocationLat = getrproutes.currentlocationLat;
                       var lastCurrentLocationLng = getrproutes.currentlocationLng;
                       
                       
                        //function to calculate current distcance complete
                        var currentdistanceCompleted = RouteFunction.calculateDistance(lastCurrentLocationLat,lastCurrentLocationLng,currentLocationLat,currentLocationLong);
                        
                        // To calculate completed distance till now to calculate  points
                        var distanceCompleted = RouteFunction.calculateDistance(startinglocationLat,startinglocationLng,currentLocationLat,currentLocationLong);
                       
                        // function to calculate total distance
                        var totalDistance = RouteFunction.calculateDistance(startinglocationLat,startinglocationLng,endinglocationLat,endinglocationLng);
                    
                    
                        var diffDistance = totalDistance - distanceCompleted; //calculate near distance
                        var distInmeters = diffDistance * 1000;  // distance in meters
                        var roundDist = Math.round(distInmeters);
                        console.log("distancecompleted : "+distanceCompleted);
                        console.log("totaldistance : "+totalDistance);
                        console.log("diffDistance : "+diffDistance);
                        console.log("distInmeters : "+distInmeters);
                        console.log("roundDist : "+roundDist);
                        
                        var jsonRoute =   RouteFunction.jsonRoutePoints(route);  // call function to get route points
                        var pointsperkm = jsonRoute.routes.pointsPerKm;   // get points per km according to route
                        points += currentdistanceCompleted  * pointsperkm;
                        
                        if(roundDist <= globalConfig.nearbyDistance ){
                            console.log("completed");
                            isRouteCompleted = "COMPLETED";
                            var bonuspoints = jsonRoute.routes.bonusPoints;   // get bonus points according to route
                            points += bonuspoints;
                            
                            //RouteFunction.updateRouteTools(email,'addHelmets');
                        }
                        else{
                            console.log("ongoing");
                            isRouteCompleted = "ONGOING";
                        }
                        
                        /* conditions to check which subroute is completed */
                        if(Math.round(distanceCompleted) == jsonRoute.routes.distanceSubRoute1 && route <= 7){
                            numberOfSubRoutesCompleted = 1;
                            RouteFunction.updateRouteTools(email,'addHelmets',route);
                        }
                        if(Math.round(distanceCompleted) == jsonRoute.routes.distanceSubRoute2 && route < 7){
                            numberOfSubRoutesCompleted = 2;
                            RouteFunction.updateRouteTools(email,'addHelmets',route);
                        }
                        if(Math.round(distanceCompleted) == jsonRoute.routes.distanceSubRoute3 && route < 7){
                            numberOfSubRoutesCompleted = 3;
                            RouteFunction.updateRouteTools(email,'addHelmets',route);
                        }
                        if(Math.round(distanceCompleted) == jsonRoute.routes.distanceSubRoute1 && route >= 8 && route <= 10){
                            numberOfSubRoutesCompleted = 1;
                            RouteFunction.updateRouteTools(email,'addHelmets',route);
                        }
                        
                        RpRoutes.update({ 
                                'email': { $regex : new RegExp(email, "i") } ,
                                'route': route
                            },
                            { 
                                $set:   { 
                                            'totalDistanceCompleted': distanceCompleted,
                                            'points':Math.round(points * 100) / 100,
                                            'isRouteCompleted':isRouteCompleted,
                                            'currentlocationLat': currentLocationLat,
                                            'currentlocationLng': currentLocationLong,
                                            'numberofRoutescompleted': numberOfSubRoutesCompleted,
                                            'lastModifiedDate': new Date(),
                                            'location':locationarray
                                        } 
                            },
                            { multi: true },
                        function(err, rprouteinfo){

                             if (err){
                                console.log("route error caught 3");
                                res.json({ 
                                    success: false, 
                                    data: null, 
                                    message: err, 
                                    code: 400
                                });
                            }else{


                                res.json({ 
                                    success: true,
                                    data: 
                                        {

                                            email       :email,
                                            route       :route,
                                            isRouteCompleted :isRouteCompleted,
                                            points      : Math.round(points * 100) / 100

                                        },
                                    message: globalConfig.successUpdate, 
                                    code: 200
                                });
                            }
                        }); 
                       
                       
                    }

        });
    }
    else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }    
        //res.send(jsonroute.routes);
    
    
});

/*
 * api route to use nails for ongoing route
 */
router.post('/use-nails', function(req, res){
        console.log("email : "+req.body.email);
        var email          = req.body.email;
        var nailsThrownAt  = req.body.nailsThrownAt;
        
        
    if(email != "" && email != undefined){
        /* find ongoing route of user */
        RpRoutes.findOne({$and : [{ $or : [ { 'isRouteCompleted' : 'CREATED' }, { 'isRouteCompleted' : 'ONGOING'} ] },{ $or : [ { email : { $regex : new RegExp(email, "i")}}]}]}, function(err, getrproutes){
            if(!getrproutes){
                    res.json({ 
                                success: true, 
                                data: null, 
                                message: "No ongoing route", 
                                code: 200
                    });
            }
            else{
                var route = getrproutes.route;
                //var points = getrproutes.points;
                var jsonRoute =   RouteFunction.jsonRoutePoints(route);
                var nailStealingPoints = jsonRoute.routes.nailStealingPoints;   //get nail stealing points of current route
                var nailExtraPoints = jsonRoute.routes.nailExtraPoints;         //get nail extra points of current route
                var points  =  +getrproutes.points+ +nailStealingPoints+ +nailExtraPoints;  // addition  of points
                
                console.log("last points : "+getrproutes.points);
                console.log("nailStealingPoints : "+nailStealingPoints);
                console.log("nailExtraPoints : "+nailExtraPoints);
                console.log(" Points : "+points);
                RpRoutes.update({ 
                                'email': { $regex : new RegExp(email, "i") } ,
                                'route': route
                            },
                            {
                                "$addToSet": {nailsthrownAt: [ nailsThrownAt]},
                                "$set": { 
                                   "points": Math.round(points * 100) / 100,
                                   "lastModifiedDate": new Date()
                                }
                            },
                            
                            { multi: true },
                        function(err, rprouteinfo){

                             if (err){
                                res.json({ 
                                    success: false, 
                                    data: null, 
                                    message: err, 
                                    code: 400
                                });
                            }else{

                                RouteFunction.updateRouteTools(email,'nailsthrow',route);
                                RouteFunction.updateRouteStealingPoints(nailsThrownAt,nailStealingPoints);
                                
                                res.json({ 
                                    success: true,
                                    data: 
                                        {

                                            email         :email,
                                            route         :route,
                                            nailsthrownAt :nailsThrownAt,
                                            points        :Math.round(points * 100) / 100,

                                        },
                                    message: globalConfig.successUpdate, 
                                    code: 200
                                });
                            }
                        }); 
                
                
            }
          
        });
    }
    else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
    
});

/*
 * Api route to watch video and update nails and patched in routetools table
 */
router.post('/watch-video', function(req, res){
    
    var email = req.body.email;
    
    if(email != "" && email != undefined){
        /* find current ongoing route of user */
        RpRoutes.findOne({$and : [{ $or : [ { 'isRouteCompleted' : 'CREATED' }, { 'isRouteCompleted' : 'ONGOING'} ] },{ $or : [ { email : { $regex : new RegExp(email, "i")}}]}]}, function(err, getrproutes){
            if(!getrproutes){
                    res.json({ 
                                success: true, 
                                data: null, 
                                message: "No ongoing route", 
                                code: 200
                    });
            }
            else{
                var route = getrproutes.route;
                var numberOfVideos = getrproutes.numberofvideos + 1;  // get number of watched videos for current route and add 1 more video
              
                RpRoutes.update({ 
                                'email': { $regex : new RegExp(email, "i") } ,
                                'route': route
                            },
                            {
                                "$set": { 
                                   "numberofvideos": numberOfVideos,
                                   "lastModifiedDate": new Date()
                                }
                            },
                            
                            { multi: true },
                        function(err, rprouteinfo){

                             if (err){
                                res.json({ 
                                    success: false, 
                                    data: null, 
                                    message: err, 
                                    code: 400
                                });
                            }else{
                                /* add 1 nail and patch on watching video in route table */
                                RouteFunction.updateRouteTools(email,'watchvideo',route);
                                
                                res.json({ 
                                    success: true,
                                    data: 
                                        {

                                            email         :email,
                                            route         :route,
                                            numberOfVideos :numberOfVideos,
                                            points        :Math.round(getrproutes.points * 100) / 100,

                                        },
                                    message: globalConfig.successUpdate, 
                                    code: 200
                                });
                            }
                        }); 
                
            }
          
        });
    }
    else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
    
});

/*
 *Api route to throw oil and update route table
 */
router.post('/use-oil', function(req, res){
        console.log("email : "+req.body.email);
        var email          = req.body.email;
        var oilThrownAt  = req.body.oilThrownAt;
        
        
    if(email != "" && email != undefined){
        /* find ongoing route of user */
        RpRoutes.findOne({$and : [{ $or : [ { 'isRouteCompleted' : 'CREATED' }, { 'isRouteCompleted' : 'ONGOING'} ] },{ $or : [ { email : { $regex : new RegExp(email, "i")}}]}]}, function(err, getrproutes){
            if(!getrproutes){
                    res.json({ 
                                success: true, 
                                data: null, 
                                message: "No ongoing route", 
                                code: 200
                    });
            }
            else{
                var route = getrproutes.route;
                //var points = getrproutes.points;
                var jsonRoute =   RouteFunction.jsonRoutePoints(route);
                var oilStealingPoints = jsonRoute.routes.oilStealingPoints;   //get oil stealing points of current route
                var oilBonusPoints = jsonRoute.routes.oilBonusPoints;         //get oil extra points of current route
                var points  =  +getrproutes.points+ +oilStealingPoints+ +oilBonusPoints;  // addition  of points
                
                console.log("last points : "+getrproutes.points);
                console.log("oilStealingPoints : "+oilStealingPoints);
                console.log("oilBonusPoints : "+oilBonusPoints);
                console.log(" Points : "+points);
                RpRoutes.update({ 
                                'email': { $regex : new RegExp(email, "i") } ,
                                'route': route
                            },
                            {
                                "$addToSet": {oilthrownAt: [ oilThrownAt]},
                                "$set": { 
                                   "points": Math.round(points * 100) / 100,
                                   "lastModifiedDate": new Date()
                                }
                            },
                            
                            { multi: true },
                        function(err, rprouteinfo){

                             if (err){
                                res.json({ 
                                    success: false, 
                                    data: null, 
                                    message: err, 
                                    code: 400
                                });
                            }else{
                                 /* add update number of oil in route table */
                                RouteFunction.updateRouteTools(email,'oilThrow',route);
                                /* update points for oilthrownAt user */
                                RouteFunction.updateRouteStealingPoints(oilThrownAt,oilStealingPoints);
                                
                                res.json({ 
                                    success: true,
                                    data: 
                                        {

                                            email         :email,
                                            route         :route,
                                            oilThrownAt :oilThrownAt,
                                            points        :Math.round(points * 100) / 100,

                                        },
                                    message: globalConfig.successUpdate, 
                                    code: 200
                                });
                            }
                        }); 
                
                
            }
          
        });
    }
    else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
    
});


/*
 *Api route to throw oil update nails and patched in routetools table
 */
router.post('/use-car', function(req, res){
        console.log("email : "+req.body.email);
        var email          = req.body.email;
        var carThrownAt  = req.body.carThrownAt;
        
        
    if(email != "" && email != undefined){
        /* find ongoing route of user */
        RpRoutes.findOne({$and : [{ $or : [ { 'isRouteCompleted' : 'CREATED' }, { 'isRouteCompleted' : 'ONGOING'} ] },{ $or : [ { email : { $regex : new RegExp(email, "i")}}]}]}, function(err, getrproutes){
            if(!getrproutes){
                    res.json({ 
                                success: true, 
                                data: null, 
                                message: "No ongoing route", 
                                code: 200
                    });
            }
            else{
                var route = getrproutes.route;
                //var points = getrproutes.points;
                var jsonRoute =   RouteFunction.jsonRoutePoints(route);
                var carStealingPoints = jsonRoute.routes.carStealingPoints;   //get car stealing points of current route
                var carBonusPoints = jsonRoute.routes.carBonusPoints;         //get car bonus points of current route
                var points  =  +getrproutes.points+ +carStealingPoints+ +carBonusPoints;  // addition  of points
                
                console.log("last points : "+getrproutes.points);
                console.log("carStealingPoints : "+carStealingPoints);
                console.log("carBonusPoints : "+carBonusPoints);
                console.log(" Points : "+points);
                RpRoutes.update({ 
                                'email': { $regex : new RegExp(email, "i") } ,
                                'route': route
                            },
                            {
                                "$addToSet": {carthrownAt: [ carThrownAt]},
                                "$set": { 
                                   "points": Math.round(points * 100) / 100,
                                   "lastModifiedDate": new Date()
                                }
                            },
                            
                            { multi: true },
                        function(err, rprouteinfo){

                             if (err){
                                res.json({ 
                                    success: false, 
                                    data: null, 
                                    message: err, 
                                    code: 400
                                });
                            }else{
                                /* update route tools when car is thrown */ 
                                RouteFunction.updateRouteTools(email,'carThrow',route);
                                RouteFunction.updateRouteStealingPoints(carThrownAt,carStealingPoints);
                                
                                res.json({ 
                                    success: true,
                                    data: 
                                        {

                                            email         :email,
                                            route         :route,
                                            carThrownAt   :carThrownAt,
                                            points        :Math.round(points * 100) / 100,

                                        },
                                    message: globalConfig.successUpdate, 
                                    code: 200
                                });
                            }
                        }); 
                
                
            }
          
        });
    }
    else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
    
});


/*
 *Api route to throw oil update nails and patched in routetools table
 */
router.post('/use-policecar', function(req, res){
        console.log("email : "+req.body.email);
        var email          = req.body.email;
        var policecarThrownAt  = req.body.policecarThrownAt;
        
        
    if(email != "" && email != undefined){
        /* find ongoing route of user */
        RpRoutes.findOne({$and : [{ $or : [ { 'isRouteCompleted' : 'CREATED' }, { 'isRouteCompleted' : 'ONGOING'} ] },{ $or : [ { email : { $regex : new RegExp(email, "i")}}]}]}, function(err, getrproutes){
            if(!getrproutes){
                    res.json({ 
                                success: true, 
                                data: null, 
                                message: "No ongoing route", 
                                code: 200
                    });
            }
            else{
                var route = getrproutes.route;
                //var points = getrproutes.points;
                var jsonRoute =   RouteFunction.jsonRoutePoints(route);
                var policecarStealingPoints = jsonRoute.routes.policecarStealingPoints;   //get car stealing points of current route
                var policecarBonusPoints = jsonRoute.routes.policecarBonusPoints;         //get car bonus points of current route
                var points  =  +getrproutes.points+ +policecarStealingPoints+ +policecarBonusPoints;  // addition  of points
                
                console.log("last points : "+getrproutes.points);
                console.log("carStealingPoints : "+policecarStealingPoints);
                console.log("carBonusPoints : "+policecarBonusPoints);
                console.log(" Points : "+points);
                RpRoutes.update({ 
                                'email': { $regex : new RegExp(email, "i") } ,
                                'route': route
                            },
                            {
                                "$addToSet": {policecarthrownAt: [ policecarThrownAt]},
                                "$set": { 
                                   "points": Math.round(points * 100) / 100,
                                   "lastModifiedDate": new Date()
                                }
                            },
                            
                            { multi: true },
                        function(err, rprouteinfo){

                             if (err){
                                res.json({ 
                                    success: false, 
                                    data: null, 
                                    message: err, 
                                    code: 400
                                });
                            }else{
                                /* update route tools when police car is thrown */
                                RouteFunction.updateRouteTools(email,'policecarThrow',route);
                                RouteFunction.updateRouteStealingPoints(policecarThrownAt,policecarStealingPoints);
                                
                                res.json({ 
                                    success: true,
                                    data: 
                                        {

                                            email         :email,
                                            route         :route,
                                            policecarThrownAt   :policecarThrownAt,
                                            points        :Math.round(points * 100) / 100,

                                        },
                                    message: globalConfig.successUpdate, 
                                    code: 200
                                });
                            }
                        }); 
                
                
            }
          
        });
    }
    else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
    
});

/*
 *Api route to use patch and update in route table
 */
router.post('/use-patch', function(req, res){
        console.log("email : "+req.body.email);
        var email          = req.body.email;
        var patchesusedBy  = req.body.patchesusedBy;
        
        
    if(email != "" && email != undefined){
        /* find ongoing route of user */
        RpRoutes.findOne({$and : [{ $or : [ { 'isRouteCompleted' : 'CREATED' }, { 'isRouteCompleted' : 'ONGOING'} ] },{ $or : [ { email : { $regex : new RegExp(email, "i")}}]}]}, function(err, getrproutes){
            if(!getrproutes){
                    res.json({ 
                                success: true, 
                                data: null, 
                                message: "No ongoing route", 
                                code: 200
                    });
            }
            else{
                var route = getrproutes.route;
                var points = getrproutes.points;
                RpRoutes.update({ 
                                'email': { $regex : new RegExp(email, "i") } ,
                                'route': route
                            },
                            {
                                "$addToSet": {patchesusedBy: [ patchesusedBy]},
                                "$set": { 
                                   "lastModifiedDate": new Date()
                                }
                            },
                            
                            { multi: true },
                        function(err, rprouteinfo){

                             if (err){
                                res.json({ 
                                    success: false, 
                                    data: null, 
                                    message: err, 
                                    code: 400
                                });
                            }else{
                                
                                /* update patches in route tools for user patchesusedBy */
                                RouteFunction.updateRouteTools(patchesusedBy,'usePatch',route);
                                
                                res.json({ 
                                    success: true,
                                    data: 
                                        {

                                            email         :email,
                                            route         :route,
                                            patchesusedBy :patchesusedBy,
                                            points        :Math.round(points * 100) / 100,

                                        },
                                    message: globalConfig.successUpdate, 
                                    code: 200
                                });
                            }
                        }); 
                
                
            }
          
        });
    }
    else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
    
});


/*
 *Api route to use wrench and update in route table
 */
router.post('/use-wrench', function(req, res){
        console.log("email : "+req.body.email);
        var email          = req.body.email;
        var wrenchusedBy  = req.body.wrenchusedBy;
        
        
    if(email != "" && email != undefined){
        /* find ongoing route of user */
        RpRoutes.findOne({$and : [{ $or : [ { 'isRouteCompleted' : 'CREATED' }, { 'isRouteCompleted' : 'ONGOING'} ] },{ $or : [ { email : { $regex : new RegExp(email, "i")}}]}]}, function(err, getrproutes){
            if(!getrproutes){
                    res.json({ 
                                success: true, 
                                data: null, 
                                message: "No ongoing route", 
                                code: 200
                    });
            }
            else{
                var route = getrproutes.route;
                var points = getrproutes.points;
                RpRoutes.update({ 
                                'email': { $regex : new RegExp(email, "i") } ,
                                'route': route
                            },
                            {
                                "$addToSet": {wrenchusedBy: [ wrenchusedBy]},
                                "$set": { 
                                   "lastModifiedDate": new Date()
                                }
                            },
                            
                            { multi: true },
                        function(err, rprouteinfo){

                             if (err){
                                res.json({ 
                                    success: false, 
                                    data: null, 
                                    message: err, 
                                    code: 400
                                });
                            }else{
                                /* update wrench for user wrenchusedBy */
                                RouteFunction.updateRouteTools(wrenchusedBy,'useWrench',route);
                                res.json({ 
                                    success: true,
                                    data: 
                                        {

                                            email         :email,
                                            route         :route,
                                            wrenchusedBy  :wrenchusedBy,
                                            points        :Math.round(points * 100) / 100,

                                        },
                                    message: globalConfig.successUpdate, 
                                    code: 200
                                });
                            }
                        }); 
                
                
            }
          
        });
    }
    else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
    
});

/*
 *Api route to use towtruck and update in route table
 */
router.post('/use-towtruck', function(req, res){
        console.log("email : "+req.body.email);
        var email          = req.body.email;
        var towtruckusedBy  = req.body.towtruckusedBy;
        
        
    if(email != "" && email != undefined){
        /* find ongoing route of user */
        RpRoutes.findOne({$and : [{ $or : [ { 'isRouteCompleted' : 'CREATED' }, { 'isRouteCompleted' : 'ONGOING'} ] },{ $or : [ { email : { $regex : new RegExp(email, "i")}}]}]}, function(err, getrproutes){
            if(!getrproutes){
                    res.json({ 
                                success: true, 
                                data: null, 
                                message: "No ongoing route", 
                                code: 200
                    });
            }
            else{
                var route = getrproutes.route;
                var points = getrproutes.points;
                RpRoutes.update({ 
                                'email': { $regex : new RegExp(email, "i") } ,
                                'route': route
                            },
                            {
                                "$addToSet": {towtruckusedBy: [ towtruckusedBy]},
                                "$set": { 
                                   "lastModifiedDate": new Date()
                                }
                            },
                            
                            { multi: true },
                        function(err, rprouteinfo){

                             if (err){
                                res.json({ 
                                    success: false, 
                                    data: null, 
                                    message: err, 
                                    code: 400
                                });
                            }else{
                                /* update towtruck for user towtruckusedBy */
                                RouteFunction.updateRouteTools(towtruckusedBy,'useTowTruck',route);
                                res.json({ 
                                    success: true,
                                    data: 
                                        {

                                            email         :email,
                                            route         :route,
                                            towtruckusedBy:towtruckusedBy,
                                            points        :Math.round(points * 100) / 100,

                                        },
                                    message: globalConfig.successUpdate, 
                                    code: 200
                                });
                            }
                        }); 
                
                
            }
          
        });
    }
    else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
    
});


/*
 *Api route to use odometer and update in route table
 */
router.post('/use-odometer', function(req, res){
        console.log("email : "+req.body.email);
        var email          = req.body.email;
        var odometerusedBy = req.body.odometerusedBy;
        
        
    if(email != "" && email != undefined){
        /* find ongoing route of user */
        RpRoutes.findOne({$and : [{ $or : [ { 'isRouteCompleted' : 'CREATED' }, { 'isRouteCompleted' : 'ONGOING'} ] },{ $or : [ { email : { $regex : new RegExp(email, "i")}}]}]}, function(err, getrproutes){
            if(!getrproutes){
                    res.json({ 
                                success: true, 
                                data: null, 
                                message: "No ongoing route", 
                                code: 200
                    });
            }
            else{
                var route = getrproutes.route;
                var points = getrproutes.points;
                RpRoutes.update({ 
                                'email': { $regex : new RegExp(email, "i") } ,
                                'route': route
                            },
                            {
                                "$addToSet": {towtruckusedBy: [ towtruckusedBy]},
                                "$set": { 
                                   "lastModifiedDate": new Date()
                                }
                            },
                            
                            { multi: true },
                        function(err, rprouteinfo){

                             if (err){
                                res.json({ 
                                    success: false, 
                                    data: null, 
                                    message: err, 
                                    code: 400
                                });
                            }else{
                                /* update odomter for user odometerusedBy */
                                RouteFunction.updateRouteTools(odometerusedBy,'useOdometer',route);
                                res.json({ 
                                    success: true,
                                    data: 
                                        {

                                            email         :email,
                                            route         :route,
                                            odometerusedBy:odometerusedBy,
                                            points        :Math.round(points * 100) / 100,

                                        },
                                    message: globalConfig.successUpdate, 
                                    code: 200
                                });
                            }
                        }); 
                
                
            }
          
        });
    }
    else{
        res.json({ 
            success: false, 
            data: null, 
            message: "missing parameters", 
            code: 400
        });
    }
    
});

/*
 * Show all users rank api
 */
router.post('/users-rank', function(req, res){

     RpRoutes.aggregate([
                {
                    $match: { 'isRouteCompleted' : 'ONGOING' }
                },
                {
                    $lookup:
                            {
                                from: "users",
                                localField: "email",
                                foreignField: "local.email",
                                as: "item"
                    }
                },
            
            { "$unwind": "$item" },
           
            {
         
                $project:   { 
                    '_id':0,
                    'firstName' : "$item.local.firstName",
                    'lastName' :"$item.local.lastName",
                    'email' : "$item.local.email",
                    'locationCountry' : "$item.local.locationCountry",
                    'locationState' :"$item.local.locationState",
                    'locationCity' :"$item.local.locationCity",
                    'profileImage' : "$item.local.profileImage",
                    'points':1,
                   
                    name: { 
                        $concat:    ["$item.local.firstName"," ","$item.local.lastName"]
                    }
                }
            },
            
            
        ], 
        
        function(err, user){
            if(err){
                res.json({ 
                    success: true,
                    data: null, 
                    message: "no record found!", 
                    code: 200
                });
            }else{
                res.json({
                    success: true,
                    data: {
                        user : user
                    }, 
                    message: "users rank", 
                    code: 200
                });
            }
        });


});

// 32 character random string token
function random_token(){
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 32; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text; 
}



module.exports = router;