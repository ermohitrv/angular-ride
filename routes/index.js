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

var globalConfig    = require('../config/globals.js');

/*SHOP section required variables */
var Products = require('../models/products');
var Orders = require('../models/orders');
var OrdersProducts = require('../models/ordersproducts');
var Payments = require('../models/payments');
var OrdersShipping = require('../models/ordersshipping');
var Events = require('../models/events');
var EventTypes = require('../models/eventtypes');

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
                            from   : "RidePrix <info@rideprix.com>",
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
    console.log("checkout login: "+req.session.checkoutlogin);
    if (req.session.adminId !== undefined && req.session.adminId !== null && req.session.checkoutlogin == false) {
        res.redirect('/admin');
    }
    if (req.session.enableaccountId !== undefined && req.session.enableaccountId !== null && req.session.checkoutlogin == false) {
        res.redirect('/profile');
    }
    if(req.session.adminId !== undefined && req.session.adminId !== null && req.session.checkoutlogin == true){
        res.redirect('/checkout');
    }
    if (req.session.enableaccountId !== undefined && req.session.enableaccountId !== null && req.session.checkoutlogin == true) {
        res.redirect('/checkout');
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
router.get('/gear', function (req, res) {
    var number_products = globalConfig.number_products_index ? globalConfig.number_products_index : 8;
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.render('shop', {
        title: 'Gear', 
        user: req.user,
        session: req.session,
        message: middleware.clear_session_value(req.session, "message"),
        message_type: middleware.clear_session_value(req.session, "message_type"),
        page_url: globalConfig.base_url
    });
});


/* shop route to render cart page */
router.get('/cart', function(req, res, next) {
    console.log('session: '+JSON.stringify(req.session));
    
    res.render('cart', { 
        title: 'Cart', 
        user: req.user,
        session: req.session,
        sessionCart: req.session.cart,
        productIds : req.session.productids,
        sessionCartItemsCount: JSON.stringify(req.session.cart_total_items),
        message: middleware.clear_session_value(req.session, "message"),
        message_type: middleware.clear_session_value(req.session, "message_type"),
    });
});

/* shop route to render cart page */
router.get('/checkout', csrfProtection, function(req, res, next) {
   
        req.session.checkoutlogin = true;
   
    // if there is no items in the cart then render a failure
    if(!req.session.cart){
        req.session.message = "The are no items in your cart. Please add some items before checking out";
        req.session.message_type = "danger";
        res.redirect("/cart");
        return;
    }
    
    // render the checkout
    res.render('checkout', { 
        title: 'Checkout', 
        csrfToken: req.csrfToken(), 
        session: req.session,
        user: req.user,
        sessionCart: req.session.cart,
        productIds : req.session.productids,
        sessionCartItemsCount: JSON.stringify(req.session.cart_total_items),
        message: middleware.clear_session_value(req.session, "message"),
        message_type: middleware.clear_session_value(req.session, "message_type"),
        payment_approved: false,
        payment_message: ''
    });
});


// The homepage of the site
router.post('/checkout_action', function(req, res, next) {
    var config = req.config.get('application');
    var paypal = require('paypal-express-checkout').init(config.paypal_username, config.paypal_password, config.paypal_signature, config.base_url + '/checkout_return', config.base_url + '/checkout_cancel', true);
    
    // if there is no items in the cart then render a failure
    if(!req.session.cart){
        req.session.message = "The are no items in your cart. Please add some items before checking out";
        req.session.message_type = "danger";
        res.redirect("/cart");
        return;
    }
    console.log(req.user.local.email);
    // new order doc
    var order_doc = { 
        order_total: req.session.total_cart_amount,
        order_email: req.body.ship_email,
        order_firstname: req.body.ship_firstname,
        order_lastname: req.body.ship_lastname,
        order_addr1: req.body.ship_addr1,
        order_addr2: req.body.ship_addr2,
        order_country: req.body.ship_country,
        order_state: req.body.ship_state,
        order_postcode: req.body.ship_postcode,
        order_status: "Processing",
        order_date: new Date(),
        order_products: req.session.cart
    };
	
    if(req.user && req.session.order_id){
        // we have an order ID (probably from a failed/cancelled payment previosuly) so lets use that.
        
        // send the order to Paypal
        middleware.order_with_paypal(req, res);
    }else if(req.user){
        console.log("product length"+req.session.productids.length);
        // no order ID so we create a new one
        /*req.db.orders.insert(order_doc, function (err, newDoc) {
            // set the order ID in the session
            req.session.order_id = newDoc._id;
            
            // send the order to Paypal
            middleware.order_with_paypal(req, res);
        });*/
        
                var newOrders                        = new Orders();
                newOrders.order_total                = req.session.total_cart_amount;
                newOrders.order_email                = req.user.local.email;
                newOrders.order_firstname            = req.user.local.firstName;
                newOrders.order_lastname             = req.user.local.lastName;    
                newOrders.order_country              = req.user.local.locationCountry;
                newOrders.order_state                = req.user.local.locationState;
                newOrders.order_city                 = req.user.local.locationCity;
                newOrders.order_postcode             = req.user.local.locationZipcode;
                newOrders.order_status               = 'Processing';

                newOrders.save(function(err,orderdata){
                    if (err){
                        console.log("route error caught 3");
                        res.json({ 
                            success: false, 
                            data: null, 
                            message: err, 
                            code: 400
                        });
                    }else{
                        req.session.order_id = orderdata._id;
                        if(req.user != ""){
                        for(var i = 0; i < req.session.productids.length; i++){ 
                            var productid = req.session.productids[i];
                            var newOrdersProducts                      = new OrdersProducts();
                            newOrdersProducts.order_id                 = orderdata._id;
                            newOrdersProducts.product_title            = req.session.cart[productid].title;
                            newOrdersProducts.product_quantity         = req.session.cart[productid].quantity;
                            newOrdersProducts.product_item_price       = req.session.cart[productid].item_price;   
                            newOrdersProducts.product_total_item_price = req.session.cart[productid].total_item_price; 
                            newOrdersProducts.product_link             = req.session.cart[productid].link;
                            newOrdersProducts.save(function(err,orderproductsdata){
                                if (err){
                                    console.log("route error caught 3");
                                    res.json({ 
                                        success: false, 
                                        data: null, 
                                        message: err, 
                                        code: 400
                                    });
                                }else{
                                    console.log("products orders saved");
                                }
                        
                            });
                        }
                    }
                    if(req.body.ship_email!=""){
                            var newOrdersShipping                            = new OrdersShipping();
                            newOrdersShipping.order_id                       = orderdata._id;
                            newOrdersShipping.order_shipemail                = req.body.ship_email;
                            newOrdersShipping.order_shipfirstname            = req.body.ship_firstname;
                            newOrdersShipping.order_shiplastname             = req.body.ship_lastname;   
                            newOrdersShipping.order_shipadd1                 = req.body.ship_addr1;
                            newOrdersShipping.order_shipadd2                 = req.body.ship_addr2;
                            newOrdersShipping.order_shipcountry              = req.body.ship_country;
                            newOrdersShipping.order_shipstate                = req.body.ship_state;
                            newOrdersShipping.order_shippostcode             = req.body.ship_postcode;
                            newOrdersShipping.save(function(err,orderproductsdata){
                                if (err){
                                    console.log("route error caught 3");
                                    res.json({ 
                                        success: false, 
                                        data: null, 
                                        message: err, 
                                        code: 400
                                    });
                                }else{
                                    console.log("shipping address saved");
                                }
                        
                            });
                    }
                        
                        middleware.order_with_paypal(req, res);
                    } 
                });
    }
});

// The homepage of the site
router.get('/checkout_return', function(req, res, next) {
    var config = req.config.get('application');
    var paypal = require('paypal-express-checkout').init(config.paypal_username, config.paypal_password, config.paypal_signature, config.base_url + '/checkout_return', config.base_url + '/checkout_cancel', true);
    var token = req.query.token;
    var PayerID = req.query.PayerID;
    paypal.detail(req.query.token, req.query.PayerID, function(err, data, invoiceNumber, price) {
        // check if payment is approved
        var payment_approved = false;
        var order_id = invoiceNumber;
        var payment_status = data.PAYMENTSTATUS;
        console.log(payment_status);
        // fully approved
        if(data.PAYMENTSTATUS == "Completed"){
            payment_approved = true;
            payment_message = "Your payment was successfully completed";
            
            // clear the cart
            if(req.session.cart){
                req.session.cart = null;
                //req.session.order_id = null;
                req.session.total_cart_amount = 0;
            }
        }
        
        // kinda approved..
        if(data.PAYMENTSTATUS == "Pending"){
            payment_approved = true;
            payment_message = "Your payment was successfully completed";
            payment_status = data.PAYMENTSTATUS + " - Reason: " + data.PENDINGREASON;
            
            // clear the cart
            if(req.session.cart){
                req.session.cart = null;
                //req.session.order_id = null;
                req.session.total_cart_amount = 0;
            }
        }
        
        // set the paymnet message
        var payment_message = data.PAYMENTSTATUS + " : " + data.REASONCODE;
        
        // on Error, set the message and failure
        if (err) {
            payment_approved = false;
            payment_message = "Error: " + err;
            if(err = "ACK Failure: Payment has already been made for this InvoiceID."){
                payment_message = "Error: Duplicate invoice payment. Please check you have not been charged and try again.";
                if(req.session.cart){
                    //req.session.order_id = null;
                }
            }
        }
        
        // catch failure returns
        if(data.ACK == "Failure"){
            payment_approved = false;
            payment_message = "Error: " + data.L_LONGMESSAGE0;
            if(req.session.cart){
                //req.session.order_id = null;
            }
        }
        
        // update the order status
//        req.db.orders.update({ _id: invoiceNumber}, { $set: { order_status: payment_status} }, { multi: false }, function (err, numReplaced) {
//            req.db.orders.findOne({ _id: invoiceNumber}, function (err, order) {
//                var lunr_doc = {
//                    order_lastname: order.order_lastname,
//                    order_email: order.order_email,
//                    order_postcode: order.order_postcode,
//                    id: order._id
//                }; 
//                
//                // add to lunr index
//                req.orders_index.add(lunr_doc);
//                
//                // show the view
//                res.render('checkout', { 
//                    title: "Checkout result",
//                    user: req.user,
//                    session: req.session,
//                    payment_approved: payment_approved,
//                    payment_message: payment_message
//                });
//            });
//        });
            

            Orders.update({ _id: req.session.order_id}, { $set: { order_status: payment_status} }, { multi: true }, function (err, orderstatusupdated) {
                 if (err){
                        console.log("route error caught 3");
                        res.json({ 
                            success: false, 
                            data: null, 
                            message: err, 
                            code: 400
                        });
                    }else{
                        var newPayments               = new Payments();
                        newPayments.username          = req.user.local.username;
                        newPayments.user_email        = req.user.local.email;
                        newPayments.payment_status    = payment_status;
                        newPayments.paypalToken       = token;    
                        newPayments.paypalPayerid     = PayerID;  
                        
                        newPayments.save(function(err,orderdata){
                            if (err){
                                console.log("route error caught 3");
                                res.json({ 
                                    success: false, 
                                    data: null, 
                                    message: err, 
                                    code: 400
                                });
                            }else{
                            req.session.order_id = null;
                            // show the view
                            res.render('checkout', { 
                                title: "Checkout result",
                                user: req.user,
                                session: req.session,
                                payment_approved: payment_approved,
                                payment_message: payment_message

                            });
                        }
                });
            }
        });





    });
});


// The homepage of the site
router.get('/checkout_cancel', function(req, res, next) {
    var config = req.config.get('application');
    var paypal = require('paypal-express-checkout').init(config.paypal_username, config.paypal_password, config.paypal_signature, config.base_url + '/checkout_return', config.base_url + '/checkout_cancel', true);
    
    paypal.detail(req.query.token, req.query.PayerID, function(err, data, invoiceNumber, price) {
        // remove the cancelled order
        Orders.remove({_id: req.session.order_id }, {}, function (err, numRemoved) {	
            // clear the order_id from the session so the user can checkout again
            if(req.session.cart){
                req.session.order_id = null;
            }
            
            var payment_approved = false;
            var payment_message = "Error: Your order was cancelled";
            
            // show the view
            res.render('checkout', { 
                title: "Checkout cancelled", 
                session: req.session,
                user: req.user,
                payment_approved: payment_approved,
                payment_message: payment_message,
                message: middleware.clear_session_value(req.session, "message"),
                message_type: middleware.clear_session_value(req.session, "message_type")
            });
        });
    });
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

router.get('/classified', function (req, res) {
   
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.render('classified', {
        title: 'Classified', 
        user: req.user,
        session: req.session,
        message: middleware.clear_session_value(req.session, "message"),
        message_type: middleware.clear_session_value(req.session, "message_type"),
        page_url: globalConfig.base_url
    });
});

router.get('/autocomplete-search', function(req, res){
  var term = req.query.term;
 
  
   Products.find({$or :[{ 'product_title': new RegExp(term, 'i') }, {'product_category': new RegExp(term, 'i')},{'product_brand': new RegExp(term, 'i')}]}, function(err, products){

  // Products.find({ 'product_title':  new RegExp(term, 'i')}, function(err, products){
    var productnames = [];
    if(products.length > 0){
      products.forEach(function(products){
         
        //usernames.push(user.local.username);
        var dataObj = { 'product_title':  products.product_title,'product_link':products.product_permalink};
        productnames.push(dataObj);
      });
    }
    
    
    res.json(productnames);
  });
});

/* search products by search bar on header*/
router.get('/searchProducts', function(req, res){
  //var searchterm = req.body.params.searchbox;
    var searchterm = req.query.search;
   
    console.log("searchterm"+searchterm);
  
    if(searchterm != "" && searchterm != undefined){
        console.log("search type");
        //Products.find({$or :[{ 'product_title': new RegExp(searchterm, 'i') }, {'product_category': new RegExp(searchterm, 'i')},{'product_brand': new RegExp(searchterm, 'i')}]}, function(err, products){


         //res.json(productnames);
         res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
         res.render('search', {
             title: 'search products', 
             user: req.user,
             session: req.session,
             searchkey:searchterm,
             //productresults:products,
             page_url: globalConfig.base_url
         });
       //});
    }else{
        console.log("no search");
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render('index', { user : req.user,title:'Homepage' });
        
    }
  
    
  
});

/* Create events route to render logged in user create events area */
router.get('/create-event', csrfProtection, middleware.isLoggedIn, function (req, res){
    
    EventTypes.find({},function (err, eventtypesList) {
        if(!err){
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.render('create-event.ejs',{
                csrfToken: req.csrfToken(),
                error : req.flash('error'), 
                user: req.user,
                eventtypesList:eventtypesList,
                title:'Create Event',
                message: '', 
                messageSuccess: ''
            });
        }else{
            console.log("Error while listing event type");
        }
    });
    
    
});

/* Save event */
router.post('/save-event', parseForm, csrfProtection, middleware.isLoggedIn, function (req, res){
    
    if (req.user.local.email != "" && req.user.local.email != undefined) {
        User.findOne({'local.email': req.user.local.email}, function (err, user) {
            if (!user) {
                
                res.redirect('/create-event');
                
            } else {
                var objEvents           = new Events();
                objEvents.eventName     = req.body.eventName;
                objEvents.eventType     = req.body.eventType;
                objEvents.eventLocation = req.body.eventLocation;
                objEvents.eventHost     = req.body.eventHost;
                objEvents.description   = req.body.eventDescription;
                objEvents.start         = req.body.eventstartDate;
                objEvents.end           = req.body.eventendDate;
                objEvents.userEmail     = req.user.local.email;
               

                objEvents.save(function (err) {
                    if (err) {
                        
                        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                        res.render('create-events.ejs', {
                            user: user, 
                            message: 'An Error Occured!, '+err, 
                            messageSuccess: '',
                            csrfToken: req.csrfToken(),
                            title:'Create Event'
                        });
                    } else {
                        
                         
                                req.flash('messageSuccess', 'Event created successfully!');
                                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                                res.render('list-events.ejs', {
                                    user: user,
                                    message: '',
                                    csrfToken: req.csrfToken(),
                                    title:'List Events',
                                    messageSuccess: req.flash('messageSuccess')
                                });
                            
                       
                       
                    }
                });
            }
        });
    }else{
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.render('list-events.ejs', {
                    user: req.user,
                    message: '',
                    csrfToken: req.csrfToken(),
                    title:'List Events'
                  
            });
    }
    
});

router.get('/list-events', csrfProtection, middleware.isLoggedIn, function (req, res){
    
    Events.find({},function (err, eventsList) {
        if(!err){
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.render('list-events.ejs',{
                csrfToken: req.csrfToken(),
                error : req.flash('error'), 
                user: req.user,
                eventsList:eventsList,
                title:'List Events',
                message: '', 
                messageSuccess: ''
            });
        }else{
            console.log("Error while listing events");
        }
    });
    
    
});

module.exports = router;
