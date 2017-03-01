var express   = require('express');
var passport  = require('passport');
var User      = require('../models/user');
var router    = express.Router();
var bodyParser  = require('body-parser');
var middleware  = require('./middleware');
/*SHOP section required variables */
var Products = require('../models/products');
var globalConfig    = require('../config/globals.js');
var Categories = require('../models/category');
var Brands = require('../models/brands');

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
    res.render('product-detail', { 
        title: " Product Detail", 
        user: req.user,
        productId : req.params.id,
        session: req.session
    });
});

/* shop route to render products list called by angular function */
router.get('/shop/products-list', function (req, res){
    var number_products = globalConfig.number_products_index ? globalConfig.number_products_index : 8;
    Products.find({product_published:'true'}).limit(number_products).exec(function (err, results) {
        if(!err){
            res.render('widget/shop-products-list',{results: results});
        }else{
            res.send(err);
        }
    });
});

/* shop route to render products list called by angular function */
router.get('/shop/products-detail/:id', function (req, res){
    console.log('id: '+req.params.id);
    Products.findOne({ product_permalink: req.params.id }, function (err, result) {
        if(result == null || result.product_published == "false"){
            res.send('error product detail page: '+err);
        }else{	
            res.header('Content-Type', 'text/html');
            res.render('widget/product-detail',{
                title: result.product_title, 
                result: result,
                user: req.user,
                product_description: result.product_description,
                session: req.session,
                message: middleware.clear_session_value(req.session, "message"),
                message_type: middleware.clear_session_value(req.session, "message_type"),
            });
        }
    });
});

/* shop route to render related products list called by angular function */
router.get('/shop/related-products-list', function (req, res){
    res.header('Content-Type', 'text/html');
    res.render('widget/related-products',{
        user: req.user,
        session: req.session,
        message: middleware.clear_session_value(req.session, "message"),
        message_type: middleware.clear_session_value(req.session, "message_type"),
    });
});

// Admin section
router.post('/addtocart', function(req, res, next) {	
    var _ = require('underscore');
    //var product_qty = req.body.product_quantity;
    //var product_quantity = req.body.product_quantity ? parseInt(product_qty): 1;
    var product_qty = req.body.params.product_quantity;
    var product_quantity = req.body.params.product_quantity ? parseInt(product_qty): 1;
    var product_id = req.body.params.product_id;
    //var product_id_array = array();
    // setup cart object if it doesn't exist
    if(!req.session.cart){
        req.session.cart = {};
        req.session.productids = [];
        
    }
    
    console.log('product_quantity: '+product_id);
    console.log('product_id: '+product_id);
    
    Products.findOne({_id: product_id}).exec(function (err, product) {
        if(product){
            var product_price = parseFloat(product.product_price).toFixed(2);
            // if exists we add to the existing value
            if(req.session.cart[product_id]){
                req.session.cart[product_id]["quantity"] = req.session.cart[product_id]["quantity"] + product_quantity;
                req.session.cart[product_id]["total_item_price"] = product_price * req.session.cart[product_id]["quantity"];
            }else{
                // Doesnt exist so we add to the cart session
                req.session.cart_total_items = req.session.cart_total_items + product_quantity;
                
                // new product deets
                var product_obj = {};
                product_obj.title = product.product_title;
                product_obj.quantity = product_quantity;
                product_obj.item_price = product_price;
                product_obj.total_item_price = product_price * product_quantity;
                product_obj.product_image = product.product_image;
                product_obj.product_brand = product.product_brand;
                if(product.product_permalink){
                    product_obj.link = product.product_permalink;
                }else{
                    product_obj.link = product._id;
                }
                
                // new product id
                var cart_obj = {};
                cart_obj[product._id] = product_obj;
                //cart_obj = product_obj;
                // merge into the current cart
                _.extend(req.session.cart, cart_obj);
                //console.log(cart_obj);
                
                  req.session.productids.push(product._id);
                  console.log(req.session.productids);
            }
            
            // update total cart amount
            middleware.update_total_cart_amount(req, res);
            
            // update how many products in the shopping cart
            req.session.cart_total_items = Object.keys(req.session.cart).length;
           
            
            
            res.status(200).json({message: 'Cart successfully updated', "total_cart_items": Object.keys(req.session.cart).length,"session":req.session});
        }else{
            res.status(400).json({message: 'Error updating cart. Please try again. '+err});
        }
    });
});

/*Remove product from cart*/
router.get('/removefromcart/:productId', function(req, res, next) {	
       var productid = req.params.productId
       delete req.session.cart[productid];
       delete req.session.productids[productid];
       var index = req.session.productids.indexOf(productid);
        if (index > -1) {
            req.session.productids.splice(index, 1);
        }
        req.session.cart_total_items = Object.keys(req.session.cart).length;
        console.log(req.session.cart);
        //res.send(true);
        res.status(200).json({"total_cart_items": Object.keys(req.session.cart).length});
});

/*update product in cart header*/
router.post('/cartproducts', function(req, res, next) {	   
     if(!req.session.cart){
        res.status(200).json({"total_cart_items":'0'});
    }else{
        req.session.cart_total_items = Object.keys(req.session.cart).length;
        res.status(200).json({"total_cart_items": Object.keys(req.session.cart).length});
    }    
});

router.post('/imageresize', function(req, res, next) {	   
//    var gm = require('../node_modules/gm');
//    gm('/public/uploads/fb-pc.jpg')
//    .resize(353, 257)
//    .autoOrient()
//    .write(writeStream, function (err) {
//      if (!err) console.log(' hooray! ');
//    }); 
//    var ImageResize = require('../node_modules/node-image-resize'),
//    fs = require('fs');
// 
//    var image = new ImageResize('/public/uploads/fb-pc.jpg');
//    image.loaded.then(function(){
//        image.smartResizeDown({
//            width: 200,
//            height: 200
//        }).then(function () {
//            image.stream(function (err, stdout, stderr) {
//                var writeStream = fs.createWriteStream('/public/uploads/resized.jpg');
//                stdout.pipe(writeStream);
//            });
//        });
//    });
        require('../node_modules/sharp');
        var transformer = sharp()
            .resize(500)
            .on('info', function(info) {
                console.log('Image height is ' + info.height);
            });

        readableStream.pipe(transformer).pipe(res);
    console.log("Image resize");
    res.status(200).json({"success": "image resize"});
});


router.post('/get-categories-list',  function(req, res){
    
    //res.send(true);
    Categories.aggregate([{$sort: {'category_added_date': 1}}], function (err, categoryList) {
        if(categoryList){
           
            res.json(categoryList);
        }else{
            res.json({});
        }
    });
});

router.get('/search/categorywisesearch/:categoryTitle',  function(req, res){
    
    //console.log("category search product"+req.body.params.categoryTitle);
    //res.send(true);
   
    Products.find({'product_category': new RegExp(req.params.categoryTitle, 'i')}, function(err, productResults){
        //console.log(productResults);
        if(!err){
            console.log(productResults);
            res.json(productResults);

        }else{
            console.log("no results");
            res.json({});

        }
    });
    

});

router.post('/get-brands-list',  function(req, res){
    
    //res.send(true);
    Brands.aggregate([{$sort: {'category_added_date': 1}}], function (err, brandsList) {
        if(brandsList){
           
            res.json(brandsList);
        }else{
            res.json({});
        }
    });
});

router.get('/search/brandsearch/:brandTitle',  function(req, res){
    
    //console.log("category search product"+req.body.params.categoryTitle);
    //res.send(true);
   
    Products.find({'product_brand': new RegExp(req.params.brandTitle, 'i')}, function(err, productResults){
        //console.log(productResults);
        if(!err){
            console.log(productResults);
            res.json(productResults);

        }else{
            console.log("no results");
            res.json({});

        }
    });
    

});

module.exports = router;
