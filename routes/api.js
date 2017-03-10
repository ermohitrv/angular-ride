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
                            rproputeInviteLink:globalConfig.websiteUrl+"/invite/"+user.local.username
                        },
                        message: "success", 
                        code: 200
                    });
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
                                    rideCategory    :req.body.rideCategory
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

//    var email                = "preeti_dev@rvtechnologies.co.in";
//    var starting_locationLat = "1.2393";
//    var starting_locationLng = "1.8184";
//    
//    var ending_locationLat   = "1.5532";
//    var ending_locationLng   = "0.4221";
    
    
    objRoute.email                  = email;
    objRoute.route                  = '1';
    
    objRoute.startinglocationLat    = starting_locationLat;
    objRoute.startinglocationLng    = starting_locationLng;
    
    objRoute.endinglocationLat      = ending_locationLat;
    objRoute.endinglocationLng      = ending_locationLng;
   
   
    objRoute.isRouteCompleted       = 'CREATED';
    //objRoute.rproute1.invitedFriends.push( { "email":"invite2@gmail.com" } );
     
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
                        locationLat : starting_locationLat,
                        locationLng : starting_locationLng,
                        activeStatus: 'INACTIVE',
                        invitedFriends: [],
                    },
                    
                }, 
                message: "route 1 added successfully", 
                code: 200
            });
        }
    });
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

// save friend request
router.post('/send-friend-request', function (req, res) {
    var friendRequestBy = req.body.friendRequestBy; //email
    var friendRequestTo = req.body.friendRequestTo; //email

    if ((friendRequestBy !== undefined && friendRequestBy !== null) && (friendRequestTo !== undefined && friendRequestTo !== null)) {
        friends.findOne({'friendRequestSentBy': friendRequestBy, 'friendRequestSentTo': friendRequestTo}, function (err, friendReq) {
            if (friendReq) {
                res.json(false);
            } else {
                newFriendReq = new friends;
                newFriendReq.friendRequestSentBy = friendRequestBy;
                newFriendReq.friendRequestSentTo = friendRequestTo;
                newFriendReq.save(function (err) {
                    if (!err) {
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
                                    rproputeInviteLink:globalConfig.websiteUrl+"/invite/"+user.local.username
                                    
                                   
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
                                    rproputeInviteLink:globalConfig.websiteUrl+"/invite/"+username
                                   
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
       

        //var email                  = 'preeti_dev@rvtechnologies.co.in';
        //var currentlocationLat     = '1.2393';
        //var currentlocationLng     = '1.8184';


        
        if(email != "" && email != undefined){
           
            RpRoutes.findOne({ 'email' :  { $regex : new RegExp(email, "i") },'isRouteCompleted': 'CREATED' }, function(err, getrproutes) {
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
                    var currentlat = currentlocationLat;
                    var startlat = getrproutes.startinglocationLat;
                    var currentlon = currentlocationLng;
                    var startlon = getrproutes.startinglocationLng;
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
                    
                    var distInmeters = dist/1000;
                    var roundDist = Math.round(distInmeters);
                    if(roundDist <= 10 ){
                       
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
                                    isRouteCompleted :'ONGOING'
                                   
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
                            message: "You can start route nearby 10m location", 
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
                    var currentlat = currentlocationLat;
                    var endlat = getrproutes.endinglocationLat;
                    var currentlon = currentlocationLng;
                    var endlon = getrproutes.endinglocationLng;
                    /* get distance between 2 positions */
                    var unit = "K";
                    var radlat1 = Math.PI * currentlat/180;
                    var radlat2 = Math.PI * endlat/180;
                    var theta = currentlon-endlon;
                    var radtheta = Math.PI * theta/180;
                    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                    dist = Math.acos(dist);
                    dist = dist * 180/Math.PI;
                    dist = dist * 60 * 1.1515;
                    if (unit=="K") { dist = dist * 1.609344; } //kilometers
                    if (unit=="N") { dist = dist * 0.8684; } //nautical miles
                    
                    var distInmeters = dist/1000;
                    var roundDist = Math.round(distInmeters);
                    if(roundDist <= 10 ){
                            isRouteCompleted = 'COMPLETED';
                    }else{
                            isRouteCompleted = 'ONGOING';
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


/* API stop endpoint to be used by mobile device for rproutes  */
/*router.post('/stop-route', function (req, res) {
        
        var Points        = require('../models/points');
        console.log("******* stop rproutes*********");
       //res.send(true);
       
        var isRouteCompleted  = 'ONGOING';
        var lastModifiedDate  = Date.now();
        
        var email                  = req.body.email;
        //var totalDistanceCompleted = req.body.totalDistanceCompleted;
        var currentlocationLat     = req.body.currentlocationLat;
        var currentlocationLng     = req.body.currentlocationLng;
        //var startinglocationLat    = req.body.startinglocationLat;
        //var startinglocationLng    = req.body.startinglocationLng;
        var endinglocationLat      = req.body.endinglocationLat;
        var endinglocationLng      = req.body.endinglocationLng;

//        var email                  = 'preeti_dev@rvtechnologies.co.in';
//        var totalDistanceCompleted = '10';
//        var currentlocationLat     = '1.2393';
//        var currentlocationLng     = '1.8184';
//        var startinglocationLat    = '1.2393';
//        var startinglocationLng    = '1.8184';
//        var endinglocationLat      = '2.2393';
//        var endinglocationLng      = '2.8184';

//                    var currentlat = currentlocationLat;
//                    var endlat = endinglocationLat;
//                    var currentlon = currentlocationLng;
//                    var endlon = endinglocationLng;
//                    var unit = "K";
//                    var radlat1 = Math.PI * currentlat/180;
//                    var radlat2 = Math.PI * endlat/180;
//                    var theta = currentlon-endlon;
//                    var radtheta = Math.PI * theta/180;
//                    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
//                    dist = Math.acos(dist);
//                    dist = dist * 180/Math.PI;
//                    dist = dist * 60 * 1.1515;
//                    if (unit=="K") { dist = dist * 1.609344; } //kilometers
//                    if (unit=="N") { dist = dist * 0.8684; } //nautical miles
//                    
//                    var distInmeters = dist/1000;
//                    var roundDist = Math.round(distInmeters);
//                    if(roundDist <= 10 ){
//                            isRouteCompleted = 'COMPLETED';
//                    }else{
//                            isRouteCompleted = 'ONGOING';
//                    }
//                    
//                    console.log("round distance****"+roundDist);
        
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
                
                RpRoutes.update({ 
                                'email': { $regex : new RegExp(email, "i") } 
                            },
                            { 
                                $set:   { 
                                            //'numberofRoutescompleted': subRoutescompleted ,
                                            //'totalDistanceCompleted':totalDistanceCompleted,
                                            'currentlocationLat': currentlocationLat,
                                            'currentlocationLng': currentlocationLng ,
                                            //'startinglocationLat': startinglocationLat,
                                            //'startinglocationLng': startinglocationLng ,
                                            'endinglocationLat': endinglocationLat,
                                            'endinglocationLng': endinglocationLng ,
                                            'activeStatus':'ACTIVE',
                                            'isRouteCompleted': 'ONGOING',
                                             'lastModifiedDate': lastModifiedDate,
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
                                    route       :rprouteinfo.route,
                                    //points      :points,
                                    isRouteCompleted :isRouteCompleted
                                   
                                },
                            message: globalConfig.successUpdate, 
                            code: 200
                        });
                    }
                });    

                }
                else{ 
                var riderproute = '1';    
               
               
                RpRoutes.findOne({ 'email' :  { $regex : new RegExp(email, "i") },'isRouteCompleted': 'COMPLETED' }, function(err, getrproutescomplete) {
                    
                    riderproute = +getrproutescomplete.route+ +1; //get next route
                    console.log("riderproute"+riderproute);
                // if there is no user with that email
                // create the user
                var newRpRoutes                        = new RpRoutes();
                newRpRoutes.email                      = email;
                newRpRoutes.route                      = riderproute;
               // newRpRoutes.totalDistanceCompleted     = totalDistanceCompleted;
                newRpRoutes.currentlocationLat         = currentlocationLat;    
                newRpRoutes.currentlocationLng         = currentlocationLng;  
                //newRpRoutes.startinglocationLat        = startinglocationLat,
                //newRpRoutes.startinglocationLng        = startinglocationLng ,
                newRpRoutes.endinglocationLat          = endinglocationLat,
                newRpRoutes.endinglocationLng          = endinglocationLng ,
                newRpRoutes.activeStatus               = 'ACTIVE';
                newRpRoutes.isRouteCompleted           = 'ONGOING';

                newRpRoutes.lastModifiedDate           = lastModifiedDate,
        	// save the newRpRoutes
                newRpRoutes.save(function(err){
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
                                    route       :riderproute,
                                    //points    :points,
                                    isRouteCompleted :isRouteCompleted
                                   
                                },
                            message: globalConfig.successRegister, 
                            code: 200
                        });
                    }
                });
            }).sort({ "lastModifiedDate": -1});
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
       
});*/

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
      
      
      
    console.log('case 1 email: '+email);
     
    if(email != "" && email != undefined){
       
                var objEvents           = new Events();
                objEvents.eventName     = eventName;
                objEvents.eventType     = eventType;
                objEvents.eventLocation = location;
                objEvents.eventHost     = host;
                objEvents.startDate     = startDate;
                objEvents.endDate           = endDate;
                objEvents.userEmail     = email;
                objEvents.description   = description;
                objEvents.eventImage    = imagePath;
                objEvents.startTime     = startTime;
                objEvents.endTime       = endTime;
       
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
                                    eventHost       :host,
                                    startDate       :startDate,
                                    endDate         :endDate,
                                    eventDescription:description,
                                    userEmail       :email,
                                    image           :imagePath,
                                    startTime       :startTime,
                                    endTime         :endTime,
                                      
                                },
                            message: globalConfig.successRegister, 
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
                                    eventName     :eventName,
                                    eventType     :eventType,
                                    eventLocation :location,
                                    eventHost     :host,
                                    startDate     : startDate,
                                    endDate       : endDate,
                                    description   : description,
                                    email         : event.email,
                                    eventImage    : imagePath,
                                    startTime     : startTime,
                                    endTime       : endTime
                                   
                                },
                            message: globalConfig.successUpdate, 
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
                console.log(eventsList);
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



// 32 character random string token
function random_token(){
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 32; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text; 
}
module.exports = router;