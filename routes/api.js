/* Inititalized required modules */
var express         = require('express');
var bodyParser      = require("body-parser");
var qs              = require('querystring');
var router          = express.Router();
var User            = require('../models/user');
var globalConfig    = require('../config/globals.js');
var nodemailer      = require("nodemailer");

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
router.post('/mylocaction', function(req, res){
    var email = req.body.email;
    var lat   = req.body.lat;
    var lng   = req.body.lng;
    
    if( ( email != "" && email != undefined ) && ( lat != "" && lat != undefined ) && ( lng != "" && lng != undefined ) ){
        User.findOne({ 'local.email' :  email }, function(err, user) {
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
        User.findOne({ 'local.email' :  email }, function(err, user) {
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
                            profileImage    :user.local.profileImage,
                            rideType        :user.rideType,
                            rideExperience  :user.rideExperience,
                            rideCategory    :user.rideCategory
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

/* API endpoint to be used by mobile device for creating new account on site */
router.post('/signup', function(req, res){
    var email = req.body.email;
    console.log('*** email: '+req.body.email);
    
    if(email != "" && email != undefined){
        User.findOne({ 'local.email' :  email }, function(err, user) {
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
                //var username                    = email.substring(0, email.lastIndexOf("@"))+'-'+req.body.lastName;
                var newUser                     = new User();
                var username                    = req.body.username;
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
        var User = require('../models/user');
        
        User.findOne({'local.email': email}, function (err, user){
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

/* API endpoint to be used by mobile device for changing password inside my account section */
router.post('/change-password', function(req, res){
    var email       = req.body.email;
    var newPassword = req.body.newpassword;
    var oldPassword = req.body.oldpassword;
    if( ( email != "" && email != undefined ) && ( newPassword != "" && newPassword != undefined ) && ( oldPassword != "" && oldPassword != undefined ) ){
        
        var User = require('../models/user');
        
        User.findOne({'local.email': email}, function (err, user){
            
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

// 32 character random string token
function random_token(){
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 32; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text; 
}

module.exports = router;