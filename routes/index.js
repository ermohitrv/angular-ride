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
var Joinevents = require('../models/joinevents');
var Invitation = require('../models/invitation');
var Reviews = require('../models/reviews');
var Friends = require('../models/friends');
var Followers = require('../models/followers');
var nodemailer = require("nodemailer");
var moment     = require("moment");
var multer     = require('multer');
var Activity   = require('../models/activity');
var Contact    = require('../models/contact');
var Tax        = require('../models/tax');
var Shipping        = require('../models/shipping');
var Suggestion    = require('../models/suggestion');
var EmailTemplate   = require("./emailTemplate.js");


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        var extension;

        console.log('____________ inside storage var ' + JSON.stringify(file));
        if (file.mimetype == 'image/png') {
            extension = 'png';
        } else if (file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
            extension = 'jpg';
        } else if (file.mimetype == 'image/gif') {
            extension = 'gif';
        } else if (file.mimetype == 'image/bmp') {
            extension = 'bmp';
        } else {
            extension = 'jpg';
        }

        cb(null, file.originalname); //Appending .jpg
    }
});
var upload = multer({storage: storage});

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
    var profileusername = req.params.username;
    
    console.log('username: '+profileusername);
    User.findOne({'local.username': new RegExp(["^", profileusername, "$"].join(""), "i")}, function (err, userprofile) {
        if (err) {
            res.redirect('/');
        }
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render('user-profile.ejs', { user: req.user, userprofile: userprofile, title:'User Profile' });
        //res.send(user);
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
                         var emailBody = EmailTemplate.emailMessage(html);
                        nodemailer.mail({
                            from   : "RidePrix <info@rideprix.com>",
                            to     : user.local.email,
                            subject: "RidePrix password update notification",
                            html   : emailBody // html body
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
                user.skypeUsername      = req.body.skype_username;
                user.local.locationLat  = req.body.userloclat;
                user.local.locationLng  = req.body.userloclong;

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
                        
                        req.flash('messageSuccess', 'Profile Updated!');
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
                'facebook.email'  : 1,
            } 
        }]
        ,function (err, usersList) {
            console.log(usersList);
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
    res.render('contact', { 
        user : req.user, 
        title:'Contact',
        session: req.session,
        message : req.flash('message'),
        message_type : req.flash('message_type'),
        page_url: globalConfig.base_url });
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
/*router.post('/checkout_action', function(req, res, next) {
    var html = "";
    var config = req.config.get('application');
    var paypal = require('paypal-express-checkout').init(config.paypal_username, config.paypal_password, config.paypal_signature, config.base_url + '/checkout_return', config.base_url + '/checkout_cancel', true);
    
    // if there is no items in the cart then render a failure
    if(!req.session.cart){
        req.session.message = "The are no items in your cart. Please add some items before checking out";
        req.session.message_type = "danger";
        res.redirect("/cart");
        return;
    }
    console.log("ordertotalhiddenprice : "+req.body.ordertotalhiddenprice);
    console.log("taxhiddenprice : "+req.body.taxhiddenprice);
    console.log("shippinghiddenprice : "+req.body.shippinghiddenprice);
    req.session.total_cart_amount = req.body.shiptotalamount;
    var ordertotalprice = req.body.ordertotalhiddenprice;
    var taxprice = req.body.taxhiddenprice;
    var shippingprice = req.body.shippinghiddenprice;
    // new order doc
    var order_doc = { 
        order_total: req.session.total_cart_amount,
        ship_cost: req.body.shippinghiddenprice,
        tax_cost: req.body.taxhiddenprice,
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
       
        
                var newOrders                        = new Orders();
                newOrders.order_total                = ordertotalprice;
                newOrders.ship_cost                  = shippingprice;
                newOrders.tax_cost                   = taxprice;
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
                        var date = moment(orderdata.order_date).format('YYYY-MM-DD');
                        html += 'Hello, '+req.user.local.firstName+' '+req.user.local.lastName;
                        html += '<h4>Order Details</h4>';
                        html += '<table><tr><td>Order Id: </td>'+orderdata._id+'<td></td></tr><tr><td>Placed On: </td><td>'+date+'</td></tr></table>';
                                                      
                        html += '<table style="width:100%"><td><b>Product: </b></td><td><b>Unit Price</b></td><td><b>Quantity</b></td><td><b>Total Price</b></td>';
                        
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
                            newOrdersProducts.product_color            = req.session.cart[productid].color;
                            newOrdersProducts.product_size             = req.session.cart[productid].size;
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
                            
                            html += '<tr><td style="width:50%">'+req.session.cart[productid].title+'</td><td>$'+req.session.cart[productid].item_price+'</td><td>'+req.session.cart[productid].quantity+'</td><td>$'+req.session.cart[productid].total_item_price+'</td></tr>';
                        }
                        
                            html += '<tr><td></td><td></td><td>Sub Total</td><td>$'+ordertotalprice+'</td></tr><tr><td></td><td></td><td>Estimated Shipping</td><td>$'+shippingprice+'</td></tr><tr><td></td><td></td><td>Estimated Tax</td><td>$'+taxprice+'</td></tr><tr><td></td><td></td><td>Total</td><td>$'+req.session.total_cart_amount+'</td></tr></table>';
                            html += '<h4>Billing Address:</h4>';
                            html += '<table class="vieworder"><tr><td><b>Name :</b></td><td>'+req.user.local.firstName+' '+req.user.local.lastName+'</td></tr><tr><td><b>Email :</b></td><td>'+req.user.local.email+'</td></tr><tr><td><b>Address :</b></td><td>'+req.user.local.locationCity+' '+req.user.local.locationState+' '+req.user.local.locationCountry+' '+req.user.local.locationZipcode+'</td></tr></table>';
                    }
                    if(req.body.ship_email!=""){
                            var newOrdersShipping                            = new OrdersShipping();
                            newOrdersShipping.order_id                       = orderdata._id;
                            newOrdersShipping.order_shipemail                = req.body.ship_email;
                            newOrdersShipping.order_shipfirstname            = req.body.ship_firstname;
                            newOrdersShipping.order_shiplastname             = req.body.ship_lastname;   
                            newOrdersShipping.order_shipadd1                 = req.body.ship_addr1;
                            newOrdersShipping.order_shipadd2                 = req.body.ship_addr2;
                            newOrdersShipping.order_shipcity                 = req.body.ship_city;
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
                        html += '<h4>Shipping Address:</h4>';  
                        html += '<table><tr><td><b>Name :</b></td><td>'+req.body.ship_firstname+' '+req.body.ship_lastname+'</td></tr><tr><td><b>Email :</b></td><td>'+req.body.ship_email+'</td></tr><tr><td><b>Address :</b></td><td>'+req.body.ship_addr1+' '+req.body.ship_city+' '+req.body.ship_state+' '+req.body.ship_country+','+req.body.ship_postcode+'</td></tr></table>';

                    }
                    
                    
                    html += '<br>Thank you, Team Motorcycle';
                                                        
                    var emailBody = EmailTemplate.emailMessage(html);

                    var mailOptions = {
                                                        from   : "Motorcycle <no-reply@motorcycle.com>", 
                                                        to     :  req.user.local.email,
                                                        subject: "Order Confirmation",
                                                        html   : emailBody
                    };
                        
                    nodemailer.mail(mailOptions);                               

                        middleware.order_with_paypal(req, res);
                    } 
                });
    }
});*/

router.post('/checkout_action', function(req, res, next) {
    var html = "";
    var config = req.config.get('application');
    var paypal = require('paypal-express-checkout').init(config.paypal_username, config.paypal_password, config.paypal_signature, config.base_url + '/checkout_return', config.base_url + '/checkout_cancel', true);
    
    // if there is no items in the cart then render a failure
    if(!req.session.cart){
        req.session.message = "The are no items in your cart. Please add some items before checking out";
        req.session.message_type = "danger";
        res.redirect("/cart");
        return;
    }
    console.log("ordertotalhiddenprice : "+req.body.ordertotalhiddenprice);
    console.log("taxhiddenprice : "+req.body.taxhiddenprice);
    console.log("shippinghiddenprice : "+req.body.shippinghiddenprice);
    req.session.total_cart_amount = req.body.shiptotalamount;
    var ordertotalprice = req.body.ordertotalhiddenprice;
    var taxprice = req.body.taxhiddenprice;
    var shippingprice = req.body.shippinghiddenprice;
    // new order doc
    var order_doc = { 
        order_total: req.session.total_cart_amount,
        ship_cost: req.body.shippinghiddenprice,
        tax_cost: req.body.taxhiddenprice,
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
       
        
                var newOrders                        = new Orders();
                newOrders.order_total                = ordertotalprice;
                newOrders.ship_cost                  = shippingprice;
                newOrders.tax_cost                   = taxprice;
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
                        var date = moment(orderdata.order_date).format('YYYY-MM-DD');
                        html += 'Hello, '+req.user.local.firstName+' '+req.user.local.lastName;
                        html += '<h4>Order Details</h4>';
                        html += '<div><p>Order Id : '+orderdata._id+'</p><p>Placed On: '+date+'</p></div>';
                                                      
                        html += '<div class="main"><table width="100%" cellspacing="0" cellpadding="0"><tbody><tr><th align="left" style="padding: 5px 5px">Products:</th><th align="left" style="padding: 5px 5px">Unit Price</th><th align="left" style="padding: 5px 5px">Quantity</th><th align="left" style="padding: 5px 5px">Total Price</th></tr>';
                        
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
                            newOrdersProducts.product_color            = req.session.cart[productid].color;
                            newOrdersProducts.product_size             = req.session.cart[productid].size;
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
                            html += '<tr><td style="padding: 5px 5px">'+req.session.cart[productid].title+'</td><td style="padding: 5px 5px">$'+req.session.cart[productid].item_price+'</td><td style="padding: 5px 5px">'+req.session.cart[productid].quantity+'</td><td style="padding: 5px 5px">$'+req.session.cart[productid].total_item_price+'</td></tr>';
                        }
                        
                           html += '<tr><td style="padding: 5px 5px">&nbsp;</td><td style="padding: 5px 5px">&nbsp;</td><td style="padding: 5px 5px"><strong>Sub Total</strong></td><td style="padding: 5px 5px">$'+ordertotalprice+'</td></tr>';
                           
                           html += '<tr><td style="padding: 5px 5px">&nbsp;</td><td style="padding: 5px 5px">&nbsp;</td><td style="padding: 5px 5px"><strong>Estimated Shipping</strong></td><td style="padding: 5px 5px">$'+shippingprice+'</td></tr>';
                           html += '<tr><td style="padding: 5px 5px">&nbsp;</td><td style="padding: 5px 5px">&nbsp;</td><td style="padding: 5px 5px"><strong>Estimated Tax</strong></td><td style="padding: 5px 5px">$'+taxprice+'</td></tr>';
                           html += '<tr><td style="padding: 5px 5px">&nbsp;</td><td style="padding: 5px 5px">&nbsp;</td><td style="padding: 5px 5px"><strong>Total</strong></td><td style="padding: 5px 5px">$'+req.session.total_cart_amount+'</td></tr></tbody></table>';
                        
                           
                           html += '<table width="100%" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td><h4>Billing Address:</h4><table width="100%" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td><b>Name :</b></td><td>'+req.user.local.firstName+' '+req.user.local.lastName+'</td></tr><tr><td><b>Email :</b></td><td><a href="" target="_blank">'+req.user.local.email+'</a></td></tr><tr><td><b>Address :</b></td><td>'+req.user.local.locationCity+' '+req.user.local.locationState+' '+req.user.local.locationCountry+' '+req.user.local.locationZipcode+'</td></tr></tbody></table></td>';
                           
                        
                    }
                    if(req.body.ship_email!=""){
                            var newOrdersShipping                            = new OrdersShipping();
                            newOrdersShipping.order_id                       = orderdata._id;
                            newOrdersShipping.order_shipemail                = req.body.ship_email;
                            newOrdersShipping.order_shipfirstname            = req.body.ship_firstname;
                            newOrdersShipping.order_shiplastname             = req.body.ship_lastname;   
                            newOrdersShipping.order_shipadd1                 = req.body.ship_addr1;
                            newOrdersShipping.order_shipadd2                 = req.body.ship_addr2;
                            newOrdersShipping.order_shipcity                 = req.body.ship_city;
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
                            
                       html += '<td><h4>Shipping Address:</h4><table width="100%" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td><b>Name :</b></td><td>'+req.body.ship_firstname+' '+req.body.ship_lastname+'</td></tr><tr><td><b>Email :</b></td><td><a href="" target="_blank">'+req.body.ship_email+'</a></td></tr><tr><td><b>Address :</b></td><td>'+req.body.ship_addr1+' '+req.body.ship_city+' '+req.body.ship_state+' '+req.body.ship_country+','+req.body.ship_postcode+'</td></tr></tbody></table></td></tr></tbody></table></div>';     
                     
                    }
                    
                    
                    html += '<br>Thank you, Team Motorcycle';
                                                        
                    var emailBody = EmailTemplate.emailMessage(html);

                    var mailOptions = {
                                                        from   : "Motorcycle <no-reply@motorcycle.com>", 
                                                        to     :  req.user.local.email,
                                                        subject: "Order Confirmation",
                                                        html   : emailBody
                    };
                        
                    nodemailer.mail(mailOptions);                               

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
            payment_status = data.PAYMENTSTATUS;
            
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
var cpUploadinserevent = upload.fields([{name: 'eventImage', maxCount: 1}]);
router.post('/save-event',cpUploadinserevent, parseForm, csrfProtection, middleware.isLoggedIn, function (req, res){
  
    var imagepath="";
    if(req.files['eventImage']){
        var imagearray = req.files['eventImage'];
        console.log(imagearray[0].path);
        imagepath = imagearray[0].path;
    }
    
    
   
    if (req.user.local.email != "" && req.user.local.email != undefined && req.body.event_id != "") {
        User.findOne({'local.email': req.user.local.email}, function (err, user) {
            if (!user) {
                
                res.redirect('/create-event');
                
            } else {
                var objEvents           = new Events();
                objEvents.eventName     = req.body.eventName;
                objEvents.eventType     = req.body.eventType;
                objEvents.eventLocation = req.body.eventLocation;
                objEvents.eventLocationType = req.body.locationtype;
                objEvents.eventHost     = req.body.eventHost;
                objEvents.description   = req.body.eventDescription;
                objEvents.startDate     = req.body.eventstartDate;
                objEvents.endDate       = req.body.eventendDate;
                objEvents.startTime     = req.body.eventstartTime;
                objEvents.endTime       = req.body.eventendTime;
                objEvents.userEmail     = req.user.local.email;
                objEvents.eventImage    = imagepath;
                objEvents.eventlocationLat    = req.body.eventlat;
                objEvents.eventlocationLong    = req.body.eventlong;
               

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
                             res.redirect('/list-events');  
                          
                    }
                });
            }
        });
    }else{

          res.redirect('/list-events');
    } 
    
});

router.get('/list-events', csrfProtection, middleware.isLoggedIn, function (req, res){
    
    Events.find({  'userEmail': { $regex : new RegExp(req.user.local.email, "i") }},function (err, eventsList) {
        if(!err){
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.render('list-events.ejs',{
                csrfToken: req.csrfToken(),
                error : req.flash('error'), 
                user: req.user,
                eventsList:eventsList,
                title:'List Events',
                message: '', 
                messageSuccess: req.flash('messageSuccess')
            });
        }else{
            console.log("Error while listing events");
        }
    });
    
    
});

router.post('/delete-event/', middleware.isLoggedIn, function(req, res) {
        
	// remove the article
	 Events.remove({ _id: req.body.uid } ,function(err, status){
            if(err){
              status = "error";
            }
            else{
                status = "success";
            }
            res.send(status);
          
        });
});

router.get('/updateevent', csrfProtection, middleware.isLoggedIn, function(req, res) {
    console.log("delete event id : "+req.query.id);
    //res.send(true);
    
    Events.findOne({'_id': req.query.id}, function (err, eventdata) {
        if(eventdata){
           console.log("event data");
            EventTypes.find({},function (err, eventtypesList) {
                if(!err){
                    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                    res.render('update-event', {
                        title: 'Update Event',
                        eventdata : eventdata,
                        session: req.session,
                        message: '',
                        messageSuccess: '',
                        eventtypesList:eventtypesList,
                        csrfToken: req.csrfToken(),
                        editor: true,
                        user:req.user,
                        active:'update-event'
                    });
                }else{
                    console.log("Error while listing event type");
                }
            });
        }
        else{
             console.log("no data event");
        }

    });

});

/* Update event */
var cpUploadupdateevent = upload.fields([{name: 'eventImage', maxCount: 1}]);
router.post('/update-event', cpUploadupdateevent , parseForm, csrfProtection, middleware.isLoggedIn, function (req, res){
    
    var imagepath="";
    if(req.files['eventImage']){
        var imagearray = req.files['eventImage'];
        console.log(imagearray[0].path);
        imagepath = imagearray[0].path;
    }
    
    
    
    if (req.user.local.email != "" && req.user.local.email != undefined ) {
        Events.findOne({'_id': req.body.event_id}, function (err, eventinfo) {
            if (!eventinfo) {
                
                res.redirect('/updateevent');
                
            } else {
                //var objEvents           = new Events();
                eventinfo.eventName     = req.body.eventName;
                eventinfo.eventType     = req.body.eventType;
                eventinfo.eventLocation = req.body.eventLocation;
                eventinfo.eventLocationType = req.body.locationtype
                eventinfo.eventHost     = req.body.eventHost;
                eventinfo.description   = req.body.eventDescription;
                eventinfo.startDate     = req.body.eventstartDate;
                eventinfo.endDate       = req.body.eventendDate;
                eventinfo.startTime     = req.body.eventstartTime;
                eventinfo.endTime       = req.body.eventendTime;
                if(imagepath != ""){
                   eventinfo.eventImage    = imagepath;
                }
                eventinfo.eventlocationLat    = req.body.eventlat;
                eventinfo.eventlocationLong    = req.body.eventlong;

                eventinfo.save(function (err) {
                    if (err) {
                        
                        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                        res.render('update-event.ejs', {
                            user: req.user, 
                            message: 'An Error Occured!, '+err, 
                            messageSuccess: '',
                            csrfToken: req.csrfToken(),
                            title:'Update Event'
                        });
                    } else {
                        
                            req.flash('messageSuccess', 'Event updated successfully!');
                            res.redirect('/list-events');  
                    }
                });
            }
        });
    }else{

          res.redirect('/list-events');
    }
    
});

/* events section */
router.get('/events', function (req, res) {
   
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.render('events', {
        title: 'events', 
        user: req.user,
        session: req.session,
        message: middleware.clear_session_value(req.session, "message"),
        message_type: middleware.clear_session_value(req.session, "message_type"),
        page_url: globalConfig.base_url
    });
});



/* Route to get all events map data to load on homepage */
router.get('/draw-events-map/:eventmonth', function (req, res) {
    //console.log("event month"+req.params.eventmonth);
    var eventmonth = req.params.eventmonth;
    
    console.log("eventmonth "+eventmonth);
    
    if(eventmonth != "" && eventmonth != undefined){
        if(eventmonth !== 'all'){
            eventmonth = parseInt(eventmonth);
            /*Events.find({ "$where": "this.startDate.getMonth() === "+eventmonth ,'eventLocationType':'public'}, function (err, eventsList) {
            if (err) {
                
                res.json({
                    success: true, 
                    data:null,
                    message: "error", 
                    code: 400
                });
            }
            else{
                res.json({
                    success: true, 
                    data: {
                        events : eventsList
                    },
                    message: "success", 
                    code: 200
                });
            }
            
            });*/
            
        Events.aggregate(
                [   
                   
                    
                    {
                        $lookup:
                                {
                                    from: "joinevents",
                                    localField: "_id",
                                    foreignField: "eventId",
                                    as: "item"
                         }
                    },
                    {
                        $project : {
                            '_id':1,
                            'eventName': 1,
                            'eventLocation':1,
                            'eventLocationType':1,
                            'eventHost':1,
                            'startDate':1,
                            'endDate':1,
                            'startTime':1,
                            'endTime':1,
                            'userEmail':1,
                            "eventid": "$item.eventId", 
                            "eventImage":1,
                            "count": { $size:"$item.eventId"}, 
                             month: { $month: "$startDate" }
                           
                            
                        } 
                    },
                    
                    {
                        $match:{'eventLocationType': 'public', month : eventmonth }
                    }
                     
                ]
                ,function (err, eventsList) {
                if(err){
                       res.json({
                        success: true, 
                        data:null,
                        message: "error", 
                        code: 400
                     });
                }
                else{
                   
                    res.json({
                    success: true, 
                    data: {
                        events : eventsList
                    },
                    message: "success", 
                    code: 200
                });
                }
            });
        
    }else{
        
            /*Events.find({'eventLocationType':'public'}, function (err, eventsList) {
            if (err) {
                
                res.json({
                    success: true, 
                    data:null,
                    message: "error", 
                    code: 400
                });
            }
            else{
                res.json({
                    success: true, 
                    data: {
                        events : eventsList
                    },
                    message: "success", 
                    code: 200
                });
            }
            
            });*/
          
            
            Events.aggregate(
                [   
                    {
                        $match:{'eventLocationType': 'public' }
                    },
                    
                    {
                        $lookup:
                                {
                                    from: "joinevents",
                                    localField: "_id",
                                    foreignField: "eventId",
                                    as: "item"
                         }
                    },
                    {
                        $project : {
                            '_id':1,
                            'eventName': 1,
                            'eventLocation':1,
                            'eventLocationType':1,
                            'eventHost':1,
                            'startDate':1,
                            'endDate':1,
                            'startTime':1,
                            'endTime':1,
                            'userEmail':1,
                            "eventid": "$item.eventId", 
                            "eventImage":1,
                            "count": { $size:"$item.eventId"}, 
                           
                            
                        } 
                    },
                     
                   

                ]
                ,function (err, eventsList) {
                if(err){
                       res.json({
                        success: true, 
                        data:null,
                        message: "error", 
                        code: 400
                     });
                }
                else{
                   
                    res.json({
                    success: true, 
                    data: {
                        events : eventsList
                    },
                    message: "success", 
                    code: 200
                });
                }
            });
            
    }
    }
    else{
        res.json({err:'error occured'});
    }
});
  
/* get all users to add friend */
router.post('/join-event', middleware.isLoggedIn, function (req, res){
    
   console.log("join event"+req.body.eventid);
    
     
   
   if(req.body.eventid != "" && req.body.eventid != undefined ){
          
    Events.findOne({'_id':req.body.eventid}, function (err, eventsdata) {      
        Joinevents.findOne({'userEmail': req.user.local.email,'eventId':req.body.eventid}, function (err, joineventsdata) {
            if (!joineventsdata) {
                
                var objJoinEvents           = new Joinevents();
                objJoinEvents.eventId       = req.body.eventid;
                objJoinEvents.userEmail     = req.user.local.email;
                objJoinEvents.joined        = 1;

                objJoinEvents.save(function (err) {
                if(err){
                        status = "error";
                }
                else{
                        console.log(eventsdata.startDate);
                        var starteventDate = moment(eventsdata.startDate).format('YYYY-MM-DD');
                        var endeventDate = moment(eventsdata.endDate).format('YYYY-MM-DD');
                        var starttime = starteventDate+' '+eventsdata.startTime;
                        var endtime = endeventDate+' '+eventsdata.endTime;
                        console.log(starttime);
                          
                        var html = 'Hello,<br>You are successfully registered to the event.<br><br><b>Event Title : </b>'+eventsdata.eventName+'<br><b>Host by : </b>'+eventsdata.eventHost+'<br><b>Started on : </b>'+starttime+'<br><b>Ended on : </b>'+endtime+'<br><b>Venue Location : </b>'+eventsdata.eventLocation+'<br><br>';
                            html += '<br>Thank you, Team Motorcycle';
                            
                        var emailBody = EmailTemplate.emailMessage(html);
                        
                        var mailOptions = {
                            from   : "Motorcycle <no-reply@motorcycle.com>", 
                            to     :  req.user.local.email,
                            subject: "Join Events",
                            html   : emailBody
                        };

                        nodemailer.mail(mailOptions);
                        
                        status = "success";
                        
                }
                
                res.send(status);
                
                });
            }else{
                status = "exist";
                res.send(status);
                
            }
        });
    });
       
   }else{
        res.redirect('/events');  
   }
           
    
});

router.get('/latestevents',  function (req, res){
    
    Events.find({'eventLocationType':'public' },function (err, latesteventsList) {
        if(!err){
            
            res.json(latesteventsList);
            
        }else{
            res.json({});
        }
    }).sort({'startDate':1}).limit(3);
    
});

router.post('/sendreview',  function (req, res){
    
   console.log("send reviews"+req.user.local.username);
   
      Reviews.findOne({ 'username' :  req.user.local.username,'productId':req.body.productId }, function (err, reviews){
            if(reviews){
                 res.status(200).json({"status": "exist"});
            }
            else{
            var objReviews           = new Reviews();
            objReviews.userReview    = req.body.reviewdesc;
            objReviews.username      = req.user.local.username;
            objReviews.productId     = req.body.productId;

            objReviews.save(function (err) {
                if(err){
                        status = "error";
                       
                }
                else{
                     status = "success";
                     
                }
                
                res.status(200).json({"status": status});
                
            });
        }
    });
            
});


router.get('/autocomplete-search-friend',middleware.isLoggedIn, function(req, res){
  var term = req.query.term;
 
  
   User.find({$or :[{ 'local.firstName': new RegExp(term, 'i') }, {'local.lastName': new RegExp(term, 'i')},{'local.email': new RegExp(term, 'i')},{'local.username': new RegExp(term, 'i')}]}, function(err, users){

  // Products.find({ 'product_title':  new RegExp(term, 'i')}, function(err, products){
    var usernamesarray = [];
    if(users.length > 0){
      users.forEach(function(users){
         
        //usernames.push(user.local.username);
        var dataObj = { 'username':  users.local.username};
        usernamesarray.push(dataObj);
      });
    }
    
    
    res.json(usernamesarray);
  });
});

router.post('/sendrequest',middleware.isLoggedIn, function(req, res){
  var profileuseremail = req.body.params.profileuseremail;
  console.log("profileuseremail: "+profileuseremail);
  //res.send(true);
                var objFriends                 = new Friends();
                objFriends.friendRequestSentTo = req.body.params.profileuseremail;
                objFriends.friendRequestSentBy = req.user.local.email;
                

                objFriends.save(function (err) {
                    if (err) {
                         
                        res.status(200).json({"status": "error"});
                        
                    } else {
                        console.log("friend request");
                        var objActivity  = new Activity();
                        objActivity.notificationTo = profileuseremail;
                        objActivity.notificationBy = req.user.local.email;
                        objActivity.notificationType = "request";
                        objActivity.save(function (err) {
                                res.status(200).json({"status": "success"});  
                        });
                    }
                });
 
});

router.post('/friendstatus', function(req, res){
    var profileuseremail = req.body.params.profileuseremail;
    
    Friends.findOne({$and : [{ $or : [ { 'friendRequestSentTo' : req.user.local.email }, { 'friendRequestSentBy' : req.user.local.email} ] },{ $or : [ { 'friendRequestSentTo' : profileuseremail }, { 'friendRequestSentBy' : profileuseremail}]}]}, function(err, friendinfo){

    //Friends.findOne({'friendRequestSentBy': req.user.local.username, 'friendRequestSentTo' : profileusername }, function (err, friendinfo) {
        
        if(friendinfo){
            res.json(friendinfo);
        }else{
            res.json({});
        }
       
    });

});

router.get('/friends',middleware.isLoggedIn, function(req, res){
   

        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render('friends', {
                    title: 'friends', 
                    user: req.user,
                    session: req.session,
                    message: '', 
                    messageSuccess: '',
                    page_url: globalConfig.base_url
        });


});

router.post('/get-friendrequests-list',middleware.isLoggedIn, function(req, res){
   
//    Friends.find({'friendRequestSentTo' : req.user.local.username , 'friendRequestApprovalStatus':'pending'}, function (err, friendsdata) {
//       
//         if(friendsdata){
//            res.json(friendsdata);
//        }else{
//            res.json({});
//        }
//    });

      
         Friends.aggregate(
        [
            {
                   $match:{'friendRequestSentTo':req.user.local.email, 'friendRequestApprovalStatus':'pending'}  
            },
            
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
                                     "profileImage": "$item.local.profileImage",
                                     "friendRequestSentBy": 1,
                                          
                                }
            } 
            
        ]
        ,function (err, friendsdata) {
            console.log(friendsdata);
        if(!err){
            res.json(friendsdata);
        }else{
            res.json({});
        }
    });

});

router.get('/friendrequestaction',middleware.isLoggedIn, function(req, res){
   

        var friendrequestsentby = req.query.friendrequestsentby;
        var friendrequeststatus        = req.query.friendstatus;
        
    if(friendrequestsentby != "" && friendrequestsentby != undefined && friendrequeststatus != "" && friendrequeststatus != undefined){
        Friends.findOne({'friendRequestSentTo' : req.user.local.email , 'friendRequestSentBy' : friendrequestsentby ,'friendRequestApprovalStatus':'pending'}, function (err, friendrequest){
            if(friendrequest){
                if(friendrequeststatus == 'accept'){
                    Friends.update({'friendRequestSentTo' : req.user.local.email , 'friendRequestSentBy' : friendrequestsentby ,'friendRequestApprovalStatus':'pending'},
                        { $set: { 'friendRequestApprovalStatus': friendrequeststatus } },
                        { multi: true },

                        function(err, results){
                            var objActivity  = new Activity();
                                objActivity.notificationTo = friendrequestsentby;
                                objActivity.notificationBy = req.user.local.email;
                                objActivity.notificationType = "acceptrequest";
                                objActivity.save(function (err) {
                                
                                    console.log("Request accepted");
                                });
                           
                        }
                    );
                } 
                else if(friendrequeststatus == 'reject'){
                    Friends.remove({'friendRequestSentTo' : req.user.local.email ,'friendRequestSentBy': friendrequestsentby, 'friendRequestApprovalStatus':'pending'}, function (err, friendsdata) {
       
                            if(err){
                                 console.log("error");
                           }else{
                                 console.log("removed");
                           }
                    });
                }
        
                res.redirect('/friends');
            }else{
                res.redirect('/friends');
            }
        });
    }
    else{
         res.redirect('/friends');
    }
});

//router.post('/unfriend',middleware.isLoggedIn, function(req, res){
//   
//    var profileusername = req.body.params.profileusername;
//    
//    Friends.remove({'friendRequestSentTo' : profileusername ,'friendRequestSentBy': req.user.local.username, 'friendRequestApprovalStatus':'accept'}, function (err, friendsdata) {
//       
//         if(err){
//             res.status(200).json({"status": "error"}); 
//        }else{
//             res.status(200).json({"status": "success"}); 
//        }
//    });
//
//});

router.post('/get-friends-list',middleware.isLoggedIn, function(req, res){
   
      /*Friends.aggregate(
        [
            {
                   $match:{$and : [{ $or : [ { 'friendRequestSentTo' : req.user.local.email }, { 'friendRequestSentBy' : req.user.local.email} ] },{ $or : [ { 'friendRequestApprovalStatus' : 'accept'}]}]}  
            },
            
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
                                     "profileImage": "$item.local.profileImage",
                                     "friendRequestSentTo": 1,
                                     "friendRequestSentBy": 1,
                                          
                                }
            } 
            
        ]
        ,function (err, friendsdata) {
            console.log(friendsdata);
        if(!err){
            res.json(friendsdata);
        }else{
            res.json({});
        }
    });*/
    
    
    Friends.aggregate(
        [
            {
                   $match:{$and : [{ $or : [ { 'friendRequestSentTo' : req.user.local.email }, { 'friendRequestSentBy' : req.user.local.email} ] },{ $or : [ { 'friendRequestApprovalStatus' : 'accept'}]}]}  
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
                                     "FirstName":  { $cond: [  { $eq : [ req.user.local.email, "$friendRequestSentTo" ] }, "$item2.local.firstName", "$item1.local.firstName" ]},
                                     "LastName": { $cond: [ { $eq : [ req.user.local.email, "$friendRequestSentTo" ] }, "$item2.local.lastName", "$item1.local.lastName" ]},
                                     "profileImage": { $cond: [ { $eq : [ req.user.local.email, "$friendRequestSentTo" ] }, "$item2.local.profileImage", "$item1.local.profileImage" ]},
                                     "friendRequestSentTo": 1,
                                     "friendRequestSentBy": 1,
                                }
            } 
            
        ]
        ,function (err, friendsdata) {
        if(!err){
            res.json(friendsdata);
        }else{
            res.json({});
        }
    });
    
    
    
    
    

});

router.post('/unfriend',middleware.isLoggedIn, function(req, res){
   
    var sentBy = req.body.params.sentBy;
    var sentTo = req.body.params.sentTo;
   
     
    Friends.remove({$and : [{ $or : [ { 'friendRequestSentTo' : sentBy }, { 'friendRequestSentBy' : sentBy} ] },{ $or : [ { 'friendRequestSentTo' : sentTo }, { 'friendRequestSentBy' : sentTo}]},{ $or : [ { 'friendRequestApprovalStatus' : 'accept'}]}]}, function(err, friendsdata){
          
         if(err){
             res.status(200).json({"status": "error"}); 
        }else{
             res.status(200).json({"status": "success"}); 
        }
    });

});

router.get('/send-invitation',middleware.isLoggedIn, function(req, res){
   
    var eventId = req.query.eventId;
    var useremail   = req.user.local.email;
  
   Friends.find({$and : [{ $or : [ { 'friendRequestSentTo' : useremail }, { 'friendRequestSentBy' : useremail} ] },{ $or : [ { 'friendRequestApprovalStatus' : 'accept'}]}]}, function(err, friendsdata){
         
        if(friendsdata){
            for(var i = 0; i < friendsdata.length; i++ ){
            var friendsuseremail = "";
            console.log(friendsdata[i].friendRequestSentBy+" "+friendsdata[i].friendRequestSentTo);
            if(friendsdata[i].friendRequestSentBy == useremail){
                friendsuseremail = friendsdata[i].friendRequestSentTo;
            }
            else if(friendsdata[i].friendRequestSentTo == useremail){
                friendsuseremail = friendsdata[i].friendRequestSentBy;
            }
            console.log("friendsuseremail"+friendsuseremail);
            User.findOne({'local.email': friendsuseremail}, function (err, userdata) {
            
                Invitation.findOne({'invitationSentTo': friendsuseremail,'eventId':eventId}, function (err, joineventsdata) {
                    if (!joineventsdata) {

                        var objInvitation               = new Invitation();
                        objInvitation.eventId           = eventId;
                        objInvitation.invitationSentTo  = userdata.local.email;
                        objInvitation.invitationSentBy  = useremail;


                        objInvitation.save(function (err) {
                        if(err){
                                req.flash('messageSuccess', 'Error occured');
                                res.redirect('/list-events');  
                        }
                        else{   
                                var objActivity  = new Activity();
                                objActivity.notificationTo = userdata.local.email;
                                objActivity.notificationBy = req.user.local.email;
                                objActivity.notificationType = "invitation";
                                objActivity.save(function (err) {
                                
                                    console.log("invitation send");
                                });
                        }

                    });
                    }else{

                        console.log("user already exist in join events");

                    }
                });
            });
        }
        
            req.flash('messageSuccess', 'Invitation sent successfully!');
            res.redirect('/list-events');  
             
        }else{
            
            req.flash('messageSuccess', '');
            res.redirect('/list-events');  
        }
       
    });
    
});


router.get('/events-invitation', middleware.isLoggedIn, function (req, res){
    
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.render('events-invitation.ejs',{
                error : req.flash('error'), 
                user: req.user,
                title:'List Events',
                message: '', 
                messageSuccess: req.flash('messageSuccess')
            });

});

router.post('/get-eventsinvitation-list', middleware.isLoggedIn, function (req, res){
    
   /* Invitation.find(
           
            {  
                'invitationSentTo': req.user.local.username, 'invitationApprovalStatus' : 'pending'
    
    
    
            }
    
      
    ,function (err, eventsInvitation) {
        if(!err){
            
            res.status(200).json({"status": "success","eventsInvitation":eventsInvitation});
            
        }else{
            
             res.status(200).json({"status": "error"}); 
        }
    });*/
    
    
      Invitation.aggregate(
        [   
            {
                $match:{'invitationSentTo': req.user.local.email ,'invitationApprovalStatus' : 'pending'}
            },
           
            {
                $lookup:
                        {
                            from: "events",
                            localField: "eventId",
                            foreignField: "_id",
                            as: "item"
                 }
            },
            {
                $project : {
                    '_id':1,
                    'eventId' : 1,
                    'invitationSentBy' : 1,
                    'eventName': "$item.eventName",
                    'startDate': "$item.startDate",
                    'endDate': "$item.endDate",
                    'startTime': "$item.startTime",
                    'endTime': "$item.endTime",
                    'eventLocation': "$item.eventLocation",
                    

                } 
            }
            
        ]
        ,function (err, eventsInvitation) {
        if(eventsInvitation){
              
              //res.send(eventsInvitation);
             res.status(200).json({"status": "success","eventsInvitation":eventsInvitation});
        }
        else{
             res.status(200).json({"status": "error"}); 
        }
    });
    
    
});


router.get('/invitationaction',middleware.isLoggedIn, function(req, res){
   

        var invitestatus = req.query.invitestatus;
        var invitationid = req.query.invitationid;
        
    if(invitestatus != "" && invitestatus != undefined){
        Invitation.findOne({'_id' : invitationid }, function (err, invitationdata){
            if(invitationdata){
                if(invitestatus == 'accept'){
                    Invitation.update({'_id' : invitationid },
                        { $set: { 'invitationApprovalStatus': invitestatus } },
                        { multi: true },

                        function(err, results){
                            console.log(results);
                            var objJoinevents        = new Joinevents();
                            objJoinevents.eventId    = invitationdata.eventId;
                            objJoinevents.userEmail  = req.user.local.email;
                            objJoinevents.joined     = 1;


                            objJoinevents.save(function (err) {
                                if(err){
                                         console.log("joined event error");
                                }
                                else{   
                                        
                                        var objActivity  = new Activity();
                                        objActivity.notificationTo = invitationdata.invitationSentBy;
                                        objActivity.notificationBy = invitationdata.invitationSentTo;
                                        objActivity.notificationType = "eventjoined";
                                        objActivity.save(function (err) {

                                             console.log("event joined successfully");

                                        });
                                       

                                }

                            });
                            
                            
                        }
                    );
                } 
                else if(invitestatus == 'reject'){
                    Invitation.remove({'_id' : invitationid }, function (err, inviteremovedata) {
       
                            if(err){
                                 console.log("error");
                           }else{
                                 console.log("removed");
                           }
                    });
                }
        
                res.redirect('/events-invitation');
            }else{
                res.redirect('/events-invitation');
            }
        });
    }
    else{
         res.redirect('/events-invitation');
    }
});



router.post('/get-count-eventjoined', middleware.isLoggedIn, function (req, res){
    
    var eventId = req.body.params.eventId;
   
    Joinevents.count({'eventId':eventId,joined:1}, function(err, count){
       
         if(err){
             res.status(200).json({"status": "error"}); 
        }else{
             res.status(200).json({"status": "success","count": count}); 
        }
    }); 

});

router.get('/delete-previousevents' , function(req, res) {
       
        Events.remove({ endDate : {"$lt" : new Date()} }, function (err, eventsList) {

	 //Events.remove({ startDate :  } ,function(err, status){
            if(err){
              status = "error";
            }
            else{
                status = "success";
            }
            res.send(status);
          
        });
});


router.post('/follow-user' , function(req, res) {
    
    var followingUseremail = req.body.params.followingUseremail;
    console.log("followingUseremail "+followingUseremail);
    //res.send(true);
    
                var objFollowers        = new Followers();
                objFollowers.followTo    = followingUseremail;
                objFollowers.followedBy  = req.user.local.email;


                objFollowers.save(function (err) {
                        if(err){
                            res.status(200).json({"status": "error"}); 
                        }
                        else{
                                var objActivity  = new Activity();
                                objActivity.notificationTo = req.body.params.followingUseremail;
                                objActivity.notificationBy = req.user.local.email;
                                objActivity.notificationType = "follow";
                                objActivity.save(function (err) {
                                
                                    res.status(200).json({"status": "success"}); 
                                    
                                });
                        }

                });

});


router.post('/followstatus',middleware.isLoggedIn, function(req, res){
    var profileuseremail = req.body.params.profileuseremail;
    
    Followers.count({'followTo':profileuseremail,'followedBy': req.user.local.email }, function(err, followcount){

        
        if(followcount){
            res.status(200).json({"count":followcount}); 
        }else{
            res.status(200).json({"count": 0}); 
        }
       
    });

});

router.post('/unfollow',middleware.isLoggedIn, function(req, res){
   
    var followBy = req.body.params.followBy;
    var followTo = req.body.params.followTo;
   
     
    Followers.remove({'followTo':followTo,'followedBy': followBy }, function(err, friendsdata){
          
         if(err){
             res.status(200).json({"status": "error"}); 
        }else{
             res.status(200).json({"status": "success"}); 
        }
    });

});

router.get('/getnotification',middleware.isLoggedIn, function(req, res){
   
    var notificationTo = req.user.local.email;
   
//    Activity.find({'notificationTo':notificationTo}, function(err, notificationresults){
//          
//         if(err){
//             res.status(200).json({"status": "error"}); 
//        }else{
//             console.log("notificationresults");
//             console.log(notificationresults);
//             res.status(200).json({"status": "success","notificationresults":notificationresults}); 
//        }
//    }).sort({'addedOn': -1});

         Activity.aggregate(
        [
            {
                   $match:{'notificationTo':notificationTo}  
            },
            
            {
                        $lookup:
                                {
                                    from: "users",
                                    localField: "notificationBy",
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
                                     "addedOn": 1,
                                     "notificationType": 1,
                                     "profileImage": "$item.local.profileImage",
                                          
                                }
            } 
            
            
           
            
        ]
        ,function (err, notificationresults) {
            console.log(notificationresults);
        if(!err){
             res.status(200).json({"status": "success","notificationresults":notificationresults}); 
        }else{
             res.status(200).json({"status": "error"}); 
        }
    });






});

router.post('/removenotification',middleware.isLoggedIn, function(req, res){
   
    var notificationId = req.body.params.notificationId;
    //res.status(200).json({"status": "success"}); 

    Activity.remove({'_id':notificationId}, function(err, notificationresults){
          
         if(err){
             res.status(200).json({"status": "error"}); 
        }else{
             res.status(200).json({"status": "success","notificationresults":notificationresults}); 
        }
    });

});

router.post('/rating-product',  function (req, res){
    
    Reviews.findOne({ 'username' :  req.user.local.username,'productId':req.body.starproductId }, function (err, reviews){
            if (reviews) {
                        if(reviews.userRating == ""){
                        reviews.userRating = req.body.starrate;
                        reviews.save(function (err) {
                           if(err){
                                        status = "error";

                                }
                                else{
                                     status = "success";

                                }
                                res.status(200).json({"status": "success"});
                        });
                        }
                        else{
                        res.status(200).json({"status": "exist"});
                        }

            }
            else{
                           var objReviews           = new Reviews();
                            objReviews.userRating    = req.body.starrate;
                            objReviews.username      = req.user.local.username;
                            objReviews.productId     = req.body.starproductId;

                            objReviews.save(function (err) {
                                if(err){
                                        status = "error";

                                }
                                else{
                                     status = "success";

                                }

                                res.status(200).json({"status": status});

                            });
            }
        });
       
});

router.post('/requestactionfromProfile',middleware.isLoggedIn, function(req, res){
   

        var profileuseremail = req.body.params.profileuseremail;
        var pendingapproval = req.body.params.pendingapproval;
        
    if(profileuseremail != "" && profileuseremail != undefined && pendingapproval != "" && pendingapproval != undefined){
        Friends.findOne({'friendRequestSentTo' : req.user.local.email , 'friendRequestSentBy' : profileuseremail ,'friendRequestApprovalStatus':'pending'}, function (err, friendrequest){
            if(friendrequest){
                if(pendingapproval == 'accept'){
                    Friends.update({'friendRequestSentTo' : req.user.local.email , 'friendRequestSentBy' : profileuseremail ,'friendRequestApprovalStatus':'pending'},
                        { $set: { 'friendRequestApprovalStatus': pendingapproval } },
                        { multi: true },

                        function(err, results){
                                var objActivity  = new Activity();
                                objActivity.notificationTo = profileuseremail;
                                objActivity.notificationBy = req.user.local.email;
                                objActivity.notificationType = "acceptrequest";
                                objActivity.save(function (err) {
                                
                                    console.log("Request accepted");
                                });
                           
                        }
                    );
                } 
                else if(pendingapproval == 'reject'){
                    Friends.remove({'friendRequestSentTo' : req.user.local.email ,'friendRequestSentBy': profileuseremail, 'friendRequestApprovalStatus':'pending'}, function (err, friendsdata) {
       
                            if(err){
                                 console.log("error");
                           }else{
                                 console.log("removed");
                           }
                    });
                }
        
                res.status(200).json({"status": "success"});  
            }else{
                res.status(200).json({"status": "error"});  
            }
        });
    }
    else{
         res.status(200).json({"status": "error"});  
    }
});

router.get('/terms', function(req, res){
    
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.render('terms', {
        title: 'Terms', 
        user: req.user,
        session: req.session,
        message: middleware.clear_session_value(req.session, "message"),
        message_type: middleware.clear_session_value(req.session, "message_type"),
        page_url: globalConfig.base_url
    });

});

router.get('/privacy-policy', function(req, res){
    
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.render('privacy-policy', {
        title: 'Privacy Policy', 
        user: req.user,
        session: req.session,
        message: middleware.clear_session_value(req.session, "message"),
        message_type: middleware.clear_session_value(req.session, "message_type"),
        page_url: globalConfig.base_url
    });

});

router.post('/submit-contactform', function(req, res){
    
    
    var objContact                = new Contact();
    objContact.contactName        = req.body.contactName;
    objContact.contactEmail       = req.body.contactEmail;
    objContact.contactLocation    = req.body.contactLocation;
    objContact.contactPhone       = req.body.contactPhone;
    objContact.contactSubject     = req.body.contactSubject;
    objContact.contactDescription = req.body.contactDescription;
    objContact.save(function (err) {
            if(err){
                
                req.flash('messageSuccess', '');
                res.redirect('/contact'); 
            }  
            else{
                
                var html = 'Hello '+req.body.contactName+',<br>Your query submitted succesfully.<br> Thankyou for contacting us.<br><br>';
                            html += '<br>Thank you, Team Motorcycle';
               
                var emailBody = EmailTemplate.emailMessage(html);
                var mailOptions = {
                            from   : "Motorcycle <no-reply@motorcycle.com>", 
                            to     :  req.body.contactEmail,
                            subject: "Rideprix",
                            html   :  emailBody
                };
        
                var htmladmin = 'Hello,<br>'+req.body.contactDescription+'<br><br>';
                            htmladmin += '<br>Thank you, '+ req.body.contactName;
                            
                var emailBodyAdmin = EmailTemplate.emailMessage(htmladmin);
                
                var mailOptionsadmin = {
                            from   : "Motorcycle <no-reply@motorcycle.com>", 
                            to     : globalConfig.adminEmail,
                            subject: req.body.contactSubject,
                            html   : emailBodyAdmin
                };
                
                nodemailer.mail(mailOptionsadmin);
                nodemailer.mail(mailOptions);
                
                req.flash('message', 'Message submitted successfully!!');
                req.flash('message_type','success');
                res.redirect('/contact');
            }
            
    });
   
    

});

router.get('/shipping-policy', function(req, res){
    
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.render('shipping-policy', {
        title: 'Shipping Policy', 
        user: req.user,
        session: req.session,
        message: middleware.clear_session_value(req.session, "message"),
        message_type: middleware.clear_session_value(req.session, "message_type"),
        page_url: globalConfig.base_url
    });

});

router.get('/faq', function(req, res){
    
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.render('faq', {
        title: 'FAQ', 
        user: req.user,
        session: req.session,
        message: middleware.clear_session_value(req.session, "message"),
        message_type: middleware.clear_session_value(req.session, "message_type"),
        page_url: globalConfig.base_url
    });

});


router.get('/event', function(req, res){
    
    console.log("event id"+req.query.id);
    Events.findOne({'_id':req.query.id},function (err, event) {
        if(err){
            
        }
        else{
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.render('event-detail', {
                title: 'Event', 
                user: req.user,
                event:event,
                session: req.session,
                message: middleware.clear_session_value(req.session, "message"),
                message_type: middleware.clear_session_value(req.session, "message_type"),
                page_url: globalConfig.base_url
            });
        }
    });

});

router.post('/get-tax',  function (req, res){
    
        Tax.findOne({'tax_country':req.body.params.country,'tax_state':{ $regex : new RegExp(req.body.params.state, "i") } },function (err, tax) {
            if(tax){

                res.json(tax.tax_price);

            }else{
                Tax.findOne({'tax_country':req.body.params.country,'tax_state':'*' },function (err, tax) {
                    if(tax){
                        res.json(tax.tax_price);
                    }else{
                       res.json();
                    }
                });
            }
        });
    
});

router.post('/get-shipping',  function (req, res){
        console.log("weight"+req.body.params.weight);
        console.log("country"+req.body.params.country);
        
        Shipping.findOne({'shipping_country':req.body.params.country,'shipping_state':{ $regex : new RegExp(req.body.params.state, "i") }},function (err, shipping) {
            if(shipping){
                console.log("qwqwqw");
                console.log(shipping);
                res.json(shipping.shipping_price);

            }else{
                Shipping.findOne({'shipping_country':req.body.params.country,'shipping_state':'*',"shipping_weightfrom" : { $lt : req.body.params.weight }, "shipping_weightto" :{ $gt : req.body.params.weight }},function (err, shipping) {
                    if(shipping){
                        console.log("pppppp");
                        console.log(shipping);
                        res.json(shipping.shipping_price);
                    }else{
                       console.log("rrrrr");
                       console.log(shipping);
                       res.json();
                    }
                });
            }
        });
    
});

router.post('/search-results', function(req, res){
    var searchKey  = req.body.params.searchKey;
    var searchType = req.body.params.searchType;
    console.log("serach key : "+searchKey);
    console.log("serach type : "+searchType);
   
    if(searchType == "top"){
        var topresults = [];
        User.find({$or :[{ 'local.firstName': new RegExp(searchKey, 'i') }, {'local.lastName': new RegExp(searchKey, 'i')}]}, function(err, peopleResults){
            
            
        Products.find({'product_title': new RegExp(searchKey, 'i')}, function(err1, productResults){

            if(!err1){
                //console.log(productResults);
                
                
                var dataObjproducts = { 'productResults':  productResults};
                topresults.push(dataObjproducts);

        
        Events.find({'eventName': new RegExp(searchKey, 'i')}, function(err2, eventResults){

            if(!err2){
                // console.log(eventResults);
                var dataObjevents = { 'eventResults':  eventResults};
                topresults.push(dataObjevents);

            }else{
                console.log("no results");
                res.json({});

            }
            var dataObjpeople = { 'peopleResults':  peopleResults};
            topresults.push(dataObjpeople);
            
            res.json(topresults);
            
            
        }).sort({'startDate':-1}).limit(4);
        }else{
                console.log("no results");
                res.json({});

            }
        }).sort({'product_added_date':-1}).limit(4);
    }).sort({'accountCreationDate':-1}).limit(4);
       
    }
    if(searchType == "events"){
        var eventresults = [];

        Events.find({'eventName': new RegExp(searchKey, 'i')}, function(err, eventResults){

            if(!err){

                res.json(eventResults);

            }else{
                console.log("no results");
                res.json({});

            }
           
            
        }).sort({'startDate':-1}).limit(4);
        
    }
    
    if(searchType == "people"){
        var peopleresults = [];

        User.find({$or :[{ 'local.firstName': new RegExp(searchKey, 'i') }, {'local.lastName': new RegExp(searchKey, 'i')}]}, function(err, peopleResults){

            if(!err){

                res.json(peopleResults);

            }else{
                console.log("no results");
                res.json({});

            }
           
            
        });
        
    }
    
     
});


router.post('/search-events', function(req, res){
    var fromEventDate = req.body.params.fromEventDate;
    var toEventDate = req.body.params.toEventDate;
   
    Events.find({startDate: {$gte: fromEventDate, $lte: toEventDate}}, function(err, eventResults){

                if(!err){               
                    res.json(eventResults);
                }else{
                    console.log("no results");
                    res.json({});
                }

    }).sort({'startDate':-1});
   
   
    
});

router.post('/search-people', function(req, res){
    
    var city = req.body.params.city;
    var state = req.body.params.state;
    var country = req.body.params.country;
    
    
    User.find({$or :[{ 'local.locationCity': new RegExp(city, 'i') }, {'local.locationState': new RegExp(state, 'i')},{'local.locationCountry': new RegExp(country, 'i')}]}, function(err, peopleResults){

            if(!err){               
                res.json(peopleResults);
            }else{
                console.log("no results");
                res.json({});
            }
          
    });
    
});

router.post('/list-events-invite', function(req, res){
    
//    Events.find({'userEmail':new RegExp(req.user.local.email, 'i')}, function(err, eventResults){
//
//            if(!err){               
//                res.json(eventResults);
//            }else{
//                console.log("no results");
//                res.json({});
//            }
//          
//    });
      
      var userprofileemail = req.body.params.userprofileemail;
      Events.aggregate([
                    {
                        $match:{'userEmail': new RegExp(req.user.local.email, 'i')}
                    },
                    {
                        $lookup:
                                {
                                    from: "invitations",
                                    localField: "_id",
                                    foreignField: "eventId",
                                    as: "childs"
                                 }
                    },
                    {
                        $project:
                                {
                                   
                                    '_id':1,
                                    'eventName':1,
                                    'eventImage':1,
                                    
                                    "childs": {
                                       "$filter": {
                                           "input": "$childs",
                                           "as": "child",
                                           "cond": { "$eq": [ "$$child.invitationSentTo", userprofileemail ] }
                                       }
                                    }
                                    
                                }
                    },
                     
                    {
                        $project:
                                {
                                   
                                    '_id':1,
                                    'eventName':1,
                                    'eventImage':1,            
                                    "isInvited": { $size: "$childs" }
                                    
                                }
                    }
            
        ]
        ,function (err, eventResults) {
           
        if(!err){
            res.json(eventResults);
        }else{
            res.json({});
        }
    });


});

router.post('/invite-friend', function(req, res){
    
    var userprofileemail    = req.body.params.userprofileemail;
    var selectedeventArray = req.body.params.selectedeventArray;
    console.log(selectedeventArray);
    var eventId = "";
    for(var i = 0; i < selectedeventArray.length; i++){
    var eventId = selectedeventArray[i];
    
    console.log("eventId"+eventId);
    Events.findOne({'_id': eventId}, function (err, event) {
    Invitation.findOne({'invitationSentTo': userprofileemail,'eventId':event._id}, function (err, invitationeventsdata) {
                    if (!invitationeventsdata) {

                        var objInvitation               = new Invitation();
                        objInvitation.eventId           = event._id;
                        objInvitation.invitationSentTo  = userprofileemail;
                        objInvitation.invitationSentBy  = req.user.local.email;


                        objInvitation.save(function (err) {
                        if(err){
                                console.log("invitation send error");
                                 
                        }
                        else{   
                                var objActivity  = new Activity();
                                objActivity.notificationTo = userprofileemail;
                                objActivity.notificationBy = req.user.local.email;
                                objActivity.notificationType = "invitation";
                                objActivity.save(function (err) {
                                
                                    console.log("invitation send");
                                });
                        }

                    });
                    }else{

                        console.log("Invitation already sent");

                    }
    });
    });
   
    }
    
    res.json("success");
    
});


router.post('/count-friends' , function(req, res) {
    
    var counttype = req.body.params.counttype;
    var userprofileemail = req.body.params.userprofileemail;
    
    console.log("userprofileemail"+userprofileemail);
    //res.send(true);
    if(counttype == "friends"){
        Friends.count({$and : [{ $or : [ { 'friendRequestSentTo' : userprofileemail }, { 'friendRequestSentBy' : userprofileemail} ] },{ $or : [ { 'friendRequestApprovalStatus' : 'accept'}]}]}, function(err, countfriends){
            
            console.log(countfriends)
             if(err){
                 res.status(200).json({"status": "error"}); 
            }else{
                 res.status(200).json({"status": "success","countfriends": countfriends}); 
            }
        }); 
    }
    if(counttype == "followers"){
        Followers.count({'followTo':userprofileemail}, function(err, countfollowers){

             if(err){
                 res.status(200).json({"status": "error"}); 
            }else{
                 res.status(200).json({"status": "success","countfollowers": countfollowers}); 
            }
        }); 
    }
    
});
/*
 * Suggestion form
 */
router.get('/suggestion', function(req, res){ 
    res.render('suggestion', { 
        user : req.user, 
        title:'Suggestion',
        session: req.session,
        message : req.flash('message'),
        message_type : req.flash('message_type'),
        page_url: globalConfig.base_url });
});

/*
 * submit Suggestion form
 */
router.post('/submit-suggestionform', function(req, res){
    
    
    var objSuggestion                   = new Suggestion();
    objSuggestion.suggestionName        = req.body.suggestionName;
    objSuggestion.suggestionEmail       = req.body.suggestionEmail;
    objSuggestion.suggestionPhone       = req.body.suggestionPhone;
    objSuggestion.suggestionDescription = req.body.suggestionDescription;
    objSuggestion.save(function (err) {
            if(err){
                
                req.flash('messageSuccess', '');
                res.redirect('/suggestion'); 
            }  
            else{
                
                /* Email from admin to contact user*/
                var html = 'Hello '+req.body.suggestionName+',<br>Your query submitted succesfully.<br> Thankyou for suggesting us.<br><br>';
                            html += '<br>Thank you, Team Motorcycle';
                            
                var emailBody = EmailTemplate.emailMessage(html);
                
                var mailOptions = {
                            from   : "Motorcycle <no-reply@motorcycle.com>", 
                            to     :  req.body.suggestionEmail,
                            subject: "Suggestion",
                            html   :  emailBody
                };
                 
                 /* Email from contact user to admin */
                var htmladmin = 'Hello,<br>'+req.body.suggestionDescription+'<br><br>';
                            htmladmin += '<br>Thank you, '+ req.body.suggestionName;
                
                var emailBodyAdmin = EmailTemplate.emailMessage(htmladmin);
                 
                var mailOptionsadmin = {
                            from   : "Motorcycle <no-reply@motorcycle.com>", 
                            to     : globalConfig.adminEmail,
                            subject: "Suggestion",
                            html   : emailBodyAdmin
                };
                
                
                nodemailer.mail(mailOptionsadmin);
                nodemailer.mail(mailOptions);
                
                
                
                req.flash('message', 'Message submitted successfully!!');
                req.flash('message_type','success');
                res.redirect('/suggestion');
            }
            
    });
   
});

module.exports = router;
