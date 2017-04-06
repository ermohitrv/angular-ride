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
                newUser.local.profileImage      = "http://placehold.it/300?text="+req.body.firstName;
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
                    var EmailTemplate   = require('email-templates').EmailTemplate;
                    var path            = require('path');
                    var templateDir     = path.join(__dirname, '../views/templates', 'signup');
                    var signUpEmail     = new EmailTemplate(templateDir)
                    var data = { base_url: req.headers.host }
                    
//                    signUpEmail.render(data, function (err, result) {
//                      nodemailer.mail({
//                          from   : "BlogTv <no-reply@blogtv.ca>", 
//                          //to     : req.body.email,
//                          to     : 'mohit@rvtechnologies.co.in',
//                          subject: globalConfig.signupEmailSubject,
//                          html   : result.html
//                      });
//                    });
                    return done(null, newUser, req.flash('signupMessage', ''),req.flash('signupMessageSuccess', globalConfig.successRegister));
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