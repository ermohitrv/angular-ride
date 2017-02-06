/* Inititalized required modules */
var express         = require('express');
var bodyParser      = require("body-parser");
var router          = express.Router();
var User            = require('../models/user');
var RpRoutes        = require('../models/rproutes');
var globalConfig    = require('../config/globals.js');
var nodemailer      = require("nodemailer");
var friends         = require('../models/friends');

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
router.post('/init-add-route', function(req, res){
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
                                friendRequestSentTo: friendRequestBy,
                                friendRequestStatus: 'pending'
                            }, 
                            message: "friend request sent to : "+friendRequestBy, 
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

// 32 character random string token
function random_token(){
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 32; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text; 
}
module.exports = router;