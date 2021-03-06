// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy= require('passport-facebook').Strategy;
var GoogleStrategy  = require('passport-google-oauth').OAuth2Strategy;
var bodyParser      = require('body-parser');
var flash           = require('connect-flash');
// load up the user model
var User            = require('../models/user');
var globalConfig    = require('../config/globals.js');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        // find a user whose email is the same as the forms email
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err) {
                console.log("err case 1: " + err);
                return done(err);
            }else{
                console.log("err case 2: " + err);
            }

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', globalConfig.emailExists),req.flash('signupMessageSuccess', ''));
            }else{
                // if there is no user with that email
                // create the user
                //var username                    = email.substring(0, email.lastIndexOf("@"))+'-'+req.body.lastName;
                var username                    = req.body.username;
                var gender                      = req.body.gender;
                var newUser                     = new User();
                newUser.local.email             = email;
                newUser.local.password          = newUser.generateHash(password); // use the generateHash function in our user model
                newUser.local.firstName         = req.body.firstName;
                newUser.local.lastName          = req.body.lastName;
                newUser.local.gender            = gender;
                newUser.local.dob               = req.body.dob;
                newUser.local.userLevel         = 'NORMAL';    //default to NORMAL
                newUser.local.userActive        = 'ACTIVE';    //default to ACTIVE
                newUser.local.token             = globalConfig.randomString;
                newUser.local.username          = username;
                newUser.local.locationCity      = req.body.city;
                newUser.local.locationZipcode   = req.body.zipcode;
                newUser.local.locationState     = req.body.state;
                newUser.local.locationCountry   = req.body.country;
                newUser.local.profileImage      = "http://placehold.it/300";
                newUser.local.locationLat       = req.body.usersignuploclat;
                newUser.local.locationLng       = req.body.usersignuploclong;

        	// save the user
                newUser.save(function(err){
                    if (err){
                        console.log("error: "+err);
                        throw err;
                    }
                    // Sending signup mail
                    var nodemailer      = require("nodemailer");

                    var htmlC = globalConfig.emailHtmlHead+'<div style="width:580px;margin:0 auto;border:12px solid #f0f1f2;color:#696969;font:14px Arial,Helvetica,sans-serif"><table align="center" width="100%" height="auto" style="position:relative" cellpadding="0" cellspacing="0"> <tbody> <tr> <td> <center><img src="http://rideprix.com/img/paris.jpg" border="0" width="100%" height="200" class="CToWUd a6T" tabindex="0"> <img src="http://rideprix.com:2286/images/logo.png" style="width: 35%;position: absolute;top: 150px;left: 10px;"><div class="a6S" dir="ltr" style="opacity: 0.01; left: 641px; top: 270px;"></div></center> </td> </tr> </tbody></table>	<div class="content-container" style="padding:18px;">';

                    htmlC = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>RidePrix Registration</title></head><body><div style="width:580px;margin:0 auto;border:12px solid #f0f1f2;position:relative;color:#696969;font:14px Arial,Helvetica,sans-serif"><table align="center" width="100%" height="auto" style="position:relative" cellpadding="0" cellspacing="0"> <tbody> <tr> <td> <center><img src="http://rideprix.com/img/paris.jpg" border="0" width="100%" height="200" class="CToWUd a6T" tabindex="0"> <img src="http://rideprix.com:2286/images/logo.png" style="width: 35%;position: absolute;top: 150px;left: 10px;"><div class="a6S" dir="ltr" style="opacity: 0.01; left: 641px; top: 270px;"></div></center> </td> </tr> </tbody></table>	<div class="content-container" style="padding:18px;">';
                    htmlC += '<h3>Welcome to Ride Prix!</h3><p>Good Day To You, Thank you for registering to Ride Prix!</p>';
                    htmlC += '<p>Ride Prix is a platform which bridges the gap between the motorcycle rider and social relevance. </p>';
                    htmlC += '<p>Please tell all of your friends in the motorcycle community about us, we promise not to get mad. </p>';
                    htmlC += '<p>To keep up with all the latest events at Ride Prix please follow us on:</p>';
                    htmlC += '<p><table width="100%" align="center"> <tbody> <tr> <td align="center"> <br> <a href="https://www.facebook.com/rideprix" target="_blank" style="text-decoration:none;"> <img src="https://image.flaticon.com/icons/png/128/145/145802.png" border="0" hspace="3" width="34" height="32" style="border-radius: 20px;"> </a> <a href="https://twitter.com/rideprix" target="_blank" style="text-decoration:none;"> <img src="https://image.flaticon.com/icons/png/128/145/145812.png" border="0" hspace="3" width="34" height="32" style="border-radius: 20px;"> </a> <a href="https://www.instagram.com/rideprix/" target="_blank" style="text-decoration:none;"> <img src="https://image.flaticon.com/icons/png/128/187/187207.png" border="0" hspace="3" width="34" height="32" style="border-radius: 20px;"> </a></td> </tr> </tbody> </table></p>';
                    htmlC += '<p>P.S.- Kindly keep an eye on your junk mail folder.</p>';
        	          htmlC += '<p>We thank you,</p>';
                    htmlC += '<p>Team Ride Prix</p></div><table width="100%" align="center"><tbody> <tr> <td align="center"> <br> <a href="http://rideprix.com/unsubscribe/" target="_blank" style="font-size:10px;color:#666666;">Unsubscribe</a> | <a href="http://rideprix.com/contact/" target="_blank" style="font-size:10px;color:#666666;">Contact Us</a> </td> </tr> </tbody> </table></div>'+globalConfig.emailHtmlFoot;

                    // create reusable transport method (opens pool of SMTP connections)
                   var smtpTransport = nodemailer.createTransport("SMTP",{
                       service: "Gmail",
                       auth: {
                           user: globalConfig.gmailEmail,
                           pass: globalConfig.gmailPassword
                       }
                   });

                    var mailOptionsC = {
              	        from   : "RidePrix.com <info@rideprix.com>",
              	        to     : req.body.email,
              	        subject: "Welcome to Ride Prix!",
              	        html   : htmlC
              	    };
                    smtpTransport.sendMail(mailOptionsC, function(error, response){
                      return done(null, newUser, req.flash('signupMessage', ''),req.flash('signupMessageSuccess', globalConfig.successRegister));
                    });
                });
            }
        });
    }));


    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done){ // callback with email and password from our form
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  { $regex :  new RegExp(email, "i") }  }, function(err, user) {
            // if there are any errors, return the error before anything else

            if (err){
                return done(err);
            // if no user is found, return the message
            }else if (user == null){

                return done(null, false, req.flash('loginMessage', globalConfig.noUserFound));
            // if the user is found but the password is wrong
            }else if (!user.validPassword(password)){

                return done(null, false, req.flash('loginMessage', globalConfig.wrongPassword));
                // all is well, return successful user
            }else if (user != undefined && user != null){

                if(user.local.userActive === 'INACTIVE'){
                    return done(null, false, req.flash('loginMessage', globalConfig.inActiveAccount));
                    req.logout();
                }
                if(user.local.userLevel === 'ADMIN'){
                    req.session.adminId = user._id;
                    //console.log('____ _ __ _ _ ADMIN :'+req.session.adminId );
                }else{
                    req.session.userId = user._id;
                    req.session.adminId = null;
                    //console.log('____ _ __ _ _ userId :'+req.session.userId );
                }
            }else{
                console.log('*** *** Error 5 : ');
            }

            return done(null, user);
        });
    }));


    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : globalConfig.facebookAuth.clientID,
        clientSecret    : globalConfig.facebookAuth.clientSecret,
        callbackURL     : globalConfig.facebookAuth.callbackURL,
        //passReqToCallback : true,
        profileFields: ['id', 'emails', 'photos','name', 'birthday', 'about', 'gender'] //This

    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {
        //if(profile){
            // asynchronous
            process.nextTick(function() {

                // find the user in the database based on their facebook id
                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found, then log them in
                    if (user) {
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user found with that facebook id, create them
                        //console.log('** ** ** profile: '+JSON.stringify(profile));

                        var newUser            = new User();

                        // set all of the facebook information in our user model
                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.facebook.email = profile.emails[0].value;

                        //localdata
                        var username           = profile.emails[0].value.substring(0, profile.emails[0].value.lastIndexOf("@"))+'-'+profile._json.first_name;
                        newUser.local.username = username;
                        newUser.local.firstName= profile._json.first_name;
                        newUser.local.lastName = profile._json.last_name;
                        newUser.local.gender   = profile._json.gender.toUpperCase();
                        newUser.local.profileImage = profile._json.picture.data.url;
                        newUser.local.email    = profile.emails[0].value;
                        newUser.local.userLevel= 'NORMAL';    //default to NORMAL
                        newUser.local.userActive= 'ACTIVE';    //default to ACTIVE
                        newUser.local.token    = globalConfig.randomString;
                        newUser.facebookURL    = "https://www.facebook.com/profile.php?id="+profile.id;

                        // save our user to the database
                        newUser.save(function(err) {
                            if (err){
                                console.log('error occured while saving: '+err);
                                throw err;
                            }else{
                                console.log('data added');
                            }
                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }

                });
            });

    }));
}
