var express   = require('express');
var passport  = require('passport');
var User      = require('../models/user');
var router    = express.Router();
var bodyParser  = require('body-parser');
var middleware  = require('./middleware');
/*SHOP section required variables */
var Products = require('../models/products');
var globalConfig    = require('../config/globals.js');
/* Route for showing product detail page */
/*
router.get('/:productslug', function (req, res) {
    var productslug = req.params.productslug;
    if(productslug){
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render('product-detail', { 
            user : req.user,
            title:productslug
        });
    }else{
        
    }
});  
*/

// show an individual product
router.get('/:id', function(req, res) {
    
    console.log('id: '+req.params.id);
    
    Products.findOne({ product_permalink: req.params.id }, function (err, result) {
        // render 404 if page is not published
        if(result == null || result.product_published == "false"){
            //res.render('error', { message: '404 - Page not found' });
            res.send('error: '+err);
        }else{	
            var images ="";
            // show the view
            //middleware.get_images(result._id, req, res, function (images){
                res.render('product-detail', { 
                    title: result.product_title, 
                    result: result,
                    images: images,
                    user: req.user,
                    product_description: result.product_description,
                    session: req.session,
                    message: middleware.clear_session_value(req.session, "message"),
                    message_type: middleware.clear_session_value(req.session, "message_type"),
                });
            //});
        }
    });
});

/* shop route to render logged in user to shop area */
router.get('/list-products', function (req, res) {
    var number_products = globalConfig.number_products_index ? globalConfig.number_products_index : 8;
    Products.find({product_published:'true'}).limit(number_products).exec(function (err, results) {
        if(!err){
            //res.rend()
        }
        res.json({ 
            
            results: results, 
        });
        res.json({ 
            success: false, 
            data: {
                friendRequestSentTo : email,
                friendRequestApprovalStatus: 'pending'
            }, 
            message: "friend request sent to : "+email, 
            code: 400
        });
    });
});

// Admin section
router.post('/addtocart', function(req, res, next) {	
    var _ = require('underscore');
    var product_quantity = req.body.product_quantity ? parseInt(req.body.product_quantity): 1;
    
    // setup cart object if it doesn't exist
    if(!req.session.cart){
        req.session.cart = {};
    }
    
    Products.findOne({_id: req.body.product_id}).exec(function (err, product) {
        if(product){
            var product_price = parseFloat(product.product_price).toFixed(2);
            // if exists we add to the existing value
            if(req.session.cart[req.body.product_id]){
                req.session.cart[req.body.product_id]["quantity"] = req.session.cart[req.body.product_id]["quantity"] + product_quantity;
                req.session.cart[req.body.product_id]["total_item_price"] = product_price * req.session.cart[req.body.product_id]["quantity"];
            }else{
                // Doesnt exist so we add to the cart session
                req.session.cart_total_items = req.session.cart_total_items + product_quantity;
                
                // new product deets
                var product_obj = {};
                product_obj.title = product.product_title;
                product_obj.quantity = product_quantity;
                product_obj.total_item_price = product_price * product_quantity;
                if(product.product_permalink){
                    product_obj.link = product.product_permalink;
                }else{
                    product_obj.link = product._id;
                }
                
                // new product id
                var cart_obj = {};
                cart_obj[product._id] = product_obj;
                
                // merge into the current cart
                _.extend(req.session.cart, cart_obj);
            }
            
            // update total cart amount
            middleware.update_total_cart_amount(req, res);
            
            // update how many products in the shopping cart
            req.session.cart_total_items = Object.keys(req.session.cart).length;
            res.status(200).json({message: 'Cart successfully updated', "total_cart_items": Object.keys(req.session.cart).length});
        }else{
            res.status(400).json({message: 'Error updating cart. Please try again.'});
        }
    });
});

module.exports = router;
