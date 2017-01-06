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
router.get('/profile', middleware.isLoggedIn, function (req, res) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.render('profile.ejs', {user: req.user,title:'Profile'});
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
    res.redirect(req.session.returnTo || '/user/' + requestUser.local.username);
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

router.get('/admin', middleware.isAdminLoggedIn, function(req, res){
    res.render('admin-dashboard', { user : req.user,title:'Admin Dashboard' });
});

module.exports = router;
