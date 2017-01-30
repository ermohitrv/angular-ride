var express   = require('express');
var passport  = require('passport');
var User      = require('../models/user');
var router    = express.Router();

var bodyParser  = require('body-parser');
var csrf        = require('csurf');
// setup route middlewares 
var csrfProtection  = csrf({ cookie: true })
var parseForm       = bodyParser.urlencoded({ extended: true })
var middleware      = require('./middleware');

/* Route for homepage */
router.get('/', function(req, res){
    res.render('index', { user : req.user,title:'Homepage' });
});

/* SignUp route to render user to signup page for creating new account */
router.get('/signup', csrfProtection ,function (req, res) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.render('signup', { csrfToken: req.csrfToken(), error : req.flash('error'), user : req.user,title:'Signup' });
});    
    
/* SignUp route to render user to signup page for creating new account */
router.post('/signup', parseForm, csrfProtection, passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));

/* Profile route to render logged in user to profile area */
router.get('/profile', middleware.isLoggedIn, function (req, res){
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.render('profile.ejs', {user: req.user,title:'Profile'});
});

/* Profile route to render logged in user to profile area */
router.get('/profile/:username', function (req, res){
    var username = req.body.username;
    console.log('username: '+username);
    User.findOne({'local.username': new RegExp(["^", username, "$"].join(""), "i")}, function (err, user) {
        if (err) {
            res.redirect('/');
        }
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        //res.render('user-profile.ejs', { user: user, title: username+' Profile' });
        res.send(user);
    });
});

/* Update profile route to render logged in user to update profile area */
router.get('/update-profile', csrfProtection, middleware.isLoggedIn, function (req, res){
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.render('update-profile.ejs',{
        csrfToken: req.csrfToken(),
        error : req.flash('error'), 
        user: req.user,
        title:'Update Profile',
        message: '', 
        messageSuccess: ''
    });
});


// enable/disable user account
router.post('/enable-disable-account', function (req, res) {
    var bind = {};
    User.findOne({'local.username': req.user.local.username}, function (err, user) {
        if (user) {
            if (user.enableAccount === true) {
                user.enableAccount = false;
                bind.enableAccount = false;
            } else {
                user.enableAccount = true;
                bind.enableAccount = true;
            }
            user.save(function (err) {
                if(err){
                    bind.status = 0;
                    bind.message = 'Oops! Error occur while updating user account';
                } else {
                    bind.message = 'Account was updated successfully';
                    bind.status = 1;
                }
                res.json(bind);
            });
        } else {
            bind.status = 0;
            bind.message = 'Oops! No user found.';
            res.json(bind);
        }
    });
});


// check old password
router.get('/check-old-password', function(req, res){
  if(req.query.old_password != null && req.query.username != null){
    var User = require('../models/user');
    User.findOne({ 'local.username': req.query.username }, function(err, user){
      if(user){

        if( user.validPassword(req.query.old_password) ){
          res.send('match');
        }
        else{
          res.send('not match');
        }
      }
      else{
        res.send(' user not found');
      }
    });
  }
  else{
    res.send('password or username is null');
  }
});

router.post('/change-password', function(req, res){
    if( req.body.new_password != null ){
      
        var User = require('../models/user');
    
        User.findOne({ 'local.username': req.body.username }, function(err, user){
            if(user){
                user.local.password = user.generateHash(req.body.new_password);
                user.save(function(err){
                    if (!err){
                        html = 'Your password updated successfully!';
                        var nodemailer = require("nodemailer");
                        nodemailer.mail({
                            from   : "RidePrix <no-reply@rideprix.com>",
                            to     : user.local.email,
                            subject: "RidePrix password update notification",
                            html   : html // html body
                        });
                        req.flash('messageSuccess', 'Your password updated successfully!');
                        res.redirect('/update-profile');
                    }
                });
            }else{
                res.send('Username not found');
            }
        });
    }else{
        res.send('password is empty');
    }
});

router.get('/accountdeactivated', function(req, res){
    res.render('deactivateaccount', {
        user: req.user, 
        title: "Account Deactivated"
    });  
});


/* Update profile route to render logged in user to update profile area */
router.post('/update-profile', parseForm, csrfProtection, middleware.isLoggedIn, function (req, res){
    
    if (req.body.email != "" && req.body.email != undefined) {
        User.findOne({'local.email': req.body.email}, function (err, user) {
            if (!user) {
                
                res.redirect('/update-profile');
                
            } else {
            
                user.local.firstName    = req.body.firstName;
                user.local.lastName     = req.body.lastName;
                user.local.dob          = req.body.dob;
                user.local.gender       = req.body.gender;
                user.local.locationCity = req.body.city;
                user.local.locationState = req.body.state;
                user.local.locationCountry = req.body.country;
                user.userBio            = req.body.biography;
                user.facebookURL        = req.body.facebook_url;
                user.twitterURL         = req.body.twitter_url;
                user.websiteURL         = req.body.website_url;
                user.youtubeURL         = req.body.youtube_url;
                user.instagramURL       = req.body.instagram_username;
                user.skypeUsername      = req.body.skype_username;

                user.save(function (err) {
                    if (err) {
                        
                        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                        res.render('update-profile.ejs', {
                            user: user, 
                            message: 'An Error Occured!, '+err, 
                            messageSuccess: '',
                            csrfToken: req.csrfToken(),
                            title:'Update Profile'
                        });
                    } else {
                        
                        req.flash('messageSuccess', 'Your Information updated successfully!');
                        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                        res.render('update-profile.ejs', {
                            user: user,
                            message: '',
                            csrfToken: req.csrfToken(),
                            title:'Update Profile',
                            messageSuccess: req.flash('messageSuccess')
                        });
                    }
                });
            }
        });
    }else{
        res.send('email: '+req.user.local.email+' ,username: '+req.user.email);
//        res.render('update-profile.ejs', {
//            user: req.user, 
//            message: 'An Error Occured! Outer', 
//            csrfToken: req.csrfToken(),
//            title:'Update Profile',
//            messageSuccess: ''
//        });
    }
    
});

/* Route to render user to Go Live page after login process */
router.get('/loginCheckAdmin', middleware.isLoggedIn, function (req, res) {
    
    var requestUser = req.user;
    if (req.session.adminId !== undefined && req.session.adminId !== null) {
        res.redirect('/admin');
    }
    if (req.session.enableaccountId !== undefined && req.session.enableaccountId !== null) {
        res.redirect('/profile');
    }
    res.redirect(req.session.returnTo || '/profile/');
    delete req.session.returnTo;
});

/* Route to login process */
router.get('/login', csrfProtection, function(req, res){
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render('login', { 
            csrfToken: req.csrfToken(), 
            user : req.user, 
            success_loginMessage: req.flash('success_loginMessage'), 
            message: req.flash('loginMessage'), 
            title:'Login' 
        });
    }
});

/* Login route for user login */
router.post('/login', parseForm, csrfProtection, passport.authenticate('local-login', {
    successRedirect: '/loginCheckAdmin', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));

/* Route to logout user */
router.get('/logout', function(req, res, next){
    req.logout();
    req.session.save(function(err){
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});


// facebook -------------------------------

// send to facebook to do the authentication
//app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
router.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

// handle the callback after facebook has authenticated the user
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));

// twitter --------------------------------

// send to twitter to do the authentication
router.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

// handle the callback after twitter has authenticated the user
router.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));


// google ---------------------------------

// send to google to do the authentication
router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

// the callback after google has authenticated the user
router.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect : '/profile',
        failureRedirect : '/'
    })
);
    
/* Route to create a new password using token */
router.get('/create-new-password/:token',csrfProtection, function(req, res){
    var token = req.params.token;
    var User = require('../models/user');
    if(token !="" && token != undefined){
        User.findOne({'local.token': token}, function (err, user) {
            if(user){
                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.render('create-password', {
                    error: '', 
                    message: '', 
                    title:'Forget Password',
                    email: user.local.email, 
                    user: user,
                    csrfToken: req.csrfToken()
                });
            }else{
                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.render('forgot-password', {
                    error: 'Oops! invalid token', 
                    message: '', 
                    title:'Forget Password',
                    user: req.user,
                    csrfToken: req.csrfToken()
                });
            }
        });  
    }else{
        res.send('forgot-password');
    }
});

/* Route to create a new password using token */
router.get('/invite/:username',csrfProtection, function(req, res){
    var username = req.params.username;
    var User = require('../models/user');
    if(username !="" && username != undefined){
        User.findOne({'local.username': username}, function (err, user) {
            if(user){
                 res.render('invite.ejs', { user: req.user,title:'Invite',username:username,'email':user.local.email});
            }else{
                 res.render('invite.ejs', { user: req.user,title:'Invite',username:username,'email':user.local.email});
            }
        });  
    }else{
        res.render('invite.ejs', { user: req.user,title:'Invite',username:username});
    }
});

router.post('/create-new-password', function(req, res){
    var password = req.body.password;
    var token = req.body.token;
    var User = require('../models/user');
    var newPasswordUser = new User();
    if( ( password != "" && password != undefined ) && ( token != "" && token != undefined ) ) {
        User.findOne({'local.token': token}, function (err, user){
            if(user){
                User.update({ 'local.email': user.local.email },
                    { $set: { 'local.token': '', 'local.password': newPasswordUser.generateHash(password) } },
                    { multi: true },

                    function(err, results){
                        console.log(results);
                    }
                );
                req.flash('success_loginMessage', 'Password successfully Changed');
                res.redirect('/login');
            }else{
                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                req.flash('loginMessage', 'Oops! invalid token');
                res.redirect('/login');
            }
        });
    }else{
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render('create-password', {error: 'Oops! fields cannot be null', message: '', email: user.local.email, user: user} );
    }
});

/* Route to check if username adready exists while signup process */
router.post('/checkusername', function (req, res) {
    if (req.body.username != null) {
        var User = require('../models/user');
        User.findOne({'local.username': new RegExp(["^", req.body.username, "$"].join(""), "i") }, function (err, user) {
            if (user) {
                res.send('exists');
            } else {
                res.send('noexists');
            }
        });
    }
});

/* Route to check if email adready exists while signup process */
router.post('/checkemail', function (req, res) {
    if (req.body.email != null) {
        var User = require('../models/user');
        User.findOne({'local.email': req.body.email}, function (err, user) {
            if(user){
                res.send('exists');
            }else{
                res.send('noexists');
            }
        });
    }
});

/* Route to get all users map data to load on homepage */
router.get('/draw-users-map', function (req, res) {
    User.aggregate(
        [{
            $match:{'local.userActive':'ACTIVE'}
        },
        {
            $project : {
                '_id':0,
                'local.firstName' : 1,
                'local.lastName' : 1,
                'local.locationCountry' : 1,
                'local.locationState' : 1,
                'local.locationCity' : 1,
                'local.profileImage' : 1,
                'local.locationLat'  : 1,
                'local.locationLng'  : 1,
            } 
        }]
        ,function (err, usersList) {
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

router.get('/admin', middleware.isAdminLoggedIn, function(req, res){
    res.render('admin-dashboard', { user : req.user,title:'Admin Dashboard',active:'admin'});
});

router.get('/about', function(req, res){ 
    res.render('about', { user : req.user, title:'About' });
});

router.get('/contact', function(req, res){ 
    res.render('contact', { user : req.user, title:'Contact' });
});
// =========================================================================
// SHOP ROUTES =============================================================
// =========================================================================

/* shop route to render logged in user to shop area */
router.get('/shop', function (req, res) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.render('shop.ejs', { user: req.user,title:'Shop'});
});

/* Test */
router.get('/test', function (req, res) {
    var RpRoutes = require('../models/rproutes');
    RpRoutes.find({'email':'mohit1@rvtechnologies.co.in'},function(err,list){
       res.send(list); 
    });
    /*
    RpRoutes.update({'email':'mohit1@rvtechnologies.co.in'},{
        $push: { 'rproute1.invitedFriends' : { "email":"invite2@gmail.com"} } 
    },function(err, status){
        res.send(err+' done');
    });
    */
    /*
    var objRoute = new RpRoutes();
    objRoute.email = "mohit1@rvtechnologies.co.in";
    objRoute.rproute1.locationLat = "30.7333";
    objRoute.rproute1.locationLng = "76.7794";
    objRoute.rproute1.invitedFriends.push( { "email":"invite2@gmail.com" } );
    objRoute.save(function(err){
        if (err){
            res.send(err);
        }else {
          res.send('done');
        }
    });
    */
});  

module.exports = router;
