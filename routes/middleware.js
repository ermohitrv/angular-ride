var globalConfig    = require('../config/globals.js');
var loggedInUsers = {};
module.exports = {
    isLoggedIn: function (req, res, next) {
        if (req.isAuthenticated()) {
              if(req.user.enableAccount == false){
                var route_name = req.originalUrl;
                if(route_name != '/updateprofile'){
                    return res.redirect('/accountdeactivated');
                }
              }
            var loggedInUser = req.user;
            loggedInUser.lastActivityTime = Date.now();
            loggedInUsers[loggedInUser._id] = loggedInUser;

            return next();
        }
        req.session.returnTo = req.path;
        res.redirect('/login');
    },
    isAdminLoggedIn: function (req, res, next) {
        if (req.isAuthenticated() && (req.user.local.userLevel == "ADMIN")) {
            var loggedInUser = req.user;
            loggedInUser.lastActivityTime = Date.now();
            loggedInUser[loggedInUser._id] = loggedInUser;
            return next();
        }else{
            req.session.adminId = null;
            if(!req.session.checkoutlogin){
               req.session.checkoutlogin == false;
            }
        }
        if( req.session.adminId !== null && req.session.adminId !== undefined && req.session.checkoutlogin == false) {
            return next();
        }
        res.redirect('/login');
    },
    getLoggedInUsers: function () {
        return loggedInUsers;
    },
    deleteLoggedInUser: function (userId) {
        if (loggedInUsers.hasOwnProperty(userId)) {
            delete loggedInUsers[userId];
        }
        return loggedInUsers;
    },
    
    check_login : function(req, res, next){
	// if not protecting we check for public pages and don't check_login
        if(req.session.needs_setup == true){
            next();
            return;
        }

        if(req.session.user){
            next();
            return;
        }else{
            res.redirect('/login');
        }
    },
    
    restrict : function(req, res, next){
        //this.check_login(req, res, next);
        //if(req.session.needs_setup == true){
        if (req.isAuthenticated() && (req.user.local.userLevel == "ADMIN")) {
            next();
            return;
        }

        if(req.session.user){
            next();
            return;
        }else{
            res.redirect('/login');
        }
    },
    
    clear_session_value : function(session, session_var){
            var temp = session[session_var];
            session[session_var] = null;
            return temp;
    },
    
    update_total_cart_amount : function(req, res){
        var async = require('async');

        req.session.total_cart_amount = 0;
        async.each(req.session.cart, function(cart_product, callback) {
            req.session.total_cart_amount = req.session.total_cart_amount + cart_product.total_item_price;
            callback();
        });

        // under the free shipping threshold
        if(req.session.total_cart_amount < globalConfig.free_shipping_amount){
            req.session.total_cart_amount = req.session.total_cart_amount + globalConfig.flat_shipping;
            req.session.shipping_cost_applied = true;
        }else{
            req.session.shipping_cost_applied = false;
        }
    },
    
    check_directory_sync : function (directory) {  
        var fs = require('fs');
        try {
            fs.statSync(directory);
        } catch(e) {
            fs.mkdirSync(directory);
        }
    },
    
    get_images : function (dir, req, res, callback){
        var glob = require("glob");
            var fs = require("fs");

        req.db.products.findOne({_id: dir}, function (err, product) {
            // loop files in /public/uploads/
            glob("public/uploads/" + dir +"/**", {nosort: true}, function (er, files) {
                // sort array
                files.sort();

                // declare the array of objects
                var file_list = new Array();

                // loop these files
                for (var i = 0; i < files.length; i++) {

                    // only want files
                    if(fs.lstatSync(files[i]).isDirectory() == false){

                        // declare the file object and set its values
                        var file = {
                            id: i,
                            path: files[i].substring(6)
                        };

                        if(product.product_image == files[i].substring(6)){
                            file.product_image = true;
                        }

                        // push the file object into the array
                        file_list.push(file);
                    }
                }
                callback(file_list); 
            });
        });
    },
    
    order_with_paypal : function(req, res){
        
        var paypal = require('paypal-express-checkout').init(globalConfig.paypal_username, globalConfig.paypal_password, globalConfig.paypal_signature, globalConfig.base_url + '/checkout_return', globalConfig.base_url + '/checkout_cancel', true);

        // place the order with PayPal
        paypal.pay(req.session.order_id, req.session.total_cart_amount, globalConfig.paypal_cart_description, globalConfig.paypal_currency, true, function(err, url) {
            if (err) {
                console.error(err);
                // We have an error so we show the checkout with a message
                res.render('checkout', { 
                    title: "Checkout", 
                    session: req.session,
                    payment_approved: "false",
                    payment_message: err,
                    message: exports.clear_session_value(req.session, "message"),
                    message_type: exports.clear_session_value(req.session, "message_type"),
                    helpers: req.handlebars.helpers,
                    show_footer: "show_footer"
                });
                return;
            }

            // redirect to paypal webpage
            res.redirect(url);
        });
    }
};