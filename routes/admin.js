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

var globalConfig    = require('../config/globals');

/*SHOP section required variables */
var Products = require('../models/products');
var Brands = require('../models/brands');
var Categories = require('../models/category');
var Points = require('../models/points');
var EventTypes = require('../models/eventtypes');
var Reviews = require('../models/reviews');
var multer      = require('multer');
var Friends = require('../models/friends');
var Followers = require('../models/followers');
var nodemailer      = require("nodemailer");
var Contact    = require('../models/contact');
var Orders    = require('../models/orders');
var Tax    = require('../models/tax');
var Shipping    = require('../models/shipping');
var Suggestion    = require('../models/suggestion');
var mongoose         = require('mongoose');
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

/* Route for List Users */
router.get('/list-users', middleware.isAdminLoggedIn, function(req, res){
    res.render('list-users', { user : req.user, title:'Admin | List Users',active:'list-users'});
});

/* Route for List Products */
router.get('/list-products', middleware.isAdminLoggedIn, function(req, res){
    res.render('list-products', {
        message : req.flash('message'),
        message_type : req.flash('message_type'),
        user : req.user,
        title:'Admin | List Products',
        active:'list-products'
    });
});

/* Route for List Brands */
router.get('/list-brands', middleware.isAdminLoggedIn, function(req, res){
    res.render('list-brands', {
        message : req.flash('message'),
        message_type : req.flash('message_type'),
        user : req.user,
        title:'Admin | List Brands',
        active:'list-brands'
    });
});

/* Route for viewing user details */
router.get('/view-user/:id', middleware.isAdminLoggedIn, function(req, res){
    var userId = req.params.id;
    res.render('view-user', {
        user : req.user,
        userId : userId,
        title:'Admin | View User',
        active:'view-user'
    });
});

/* Route for  List Orders */
router.get('/list-orders', middleware.isAdminLoggedIn, function(req, res){
    res.render('list-orders', { user : req.user, message : req.flash('message'),message_type : req.flash('message_type'),title:'Admin | List Orders',active:'list-orders'});
});

/* Route for List Contact Requests */
router.get('/list-contact-requests', middleware.isAdminLoggedIn, function(req, res){
    res.render('list-contact-requests', { user : req.user, message : req.flash('message'),message_type : req.flash('message_type'), title:'Admin | List Contact Requests',active:'list-contact-requests'});
});

/* Route for List Suggestions */
router.get('/list-suggestions', middleware.isAdminLoggedIn, function(req, res){
    res.render('list-suggestions', { user : req.user, message : req.flash('message'),message_type : req.flash('message_type'), title:'Admin | List Suggestions',active:'list-suggestions'});
});


// =========================================================================
// ======================== ANGULAR RELATED ROUTES =========================
// =========================================================================

/* Route for List Suggestions */
router.get('/get-users-list', middleware.isAdminLoggedIn, function(req, res){
    User.aggregate([{$sort: {'local.username': 1}}], function (err, usersList) {
        if(usersList){
            res.json(usersList);
        }else{
            res.json({});
        }
    });
});

/* Route for List Suggestions */
router.get('/get-brands-list', middleware.isAdminLoggedIn, function(req, res){
    Brands.find({'brand_title':{$ne:null}},{_id:1,brand_image:1,brand_title:1,brand_description:1,brand_added_date:1},function (err, brandsList) {
        if(brandsList){
            res.json(brandsList);
        }else{
            res.json({});
        }
    });
});

/* Route for viewing user details */
router.post('/view-user-detail', middleware.isAdminLoggedIn, function(req, res){
    var user_id = req.body.params.user_id;
    console.log('user_id: '+user_id);
    if(user_id != ""){
        User.findOne({_id: user_id},{'_id':0,'local.password' : 0, accountCreationDate:0, lastActivityTime:0 },
        function (err, user) {
        Friends.count({$and : [{ $or : [ { 'friendRequestSentTo' : req.user.local.username }, { 'friendRequestSentBy' : req.user.local.username} ] },{ $or : [ { 'friendRequestApprovalStatus' : 'accept'}]}]}, function(err, friendsdata){
        Followers.count({'followedBy': req.user.local.username }, function(err, followedbycount){
        Followers.count({'followedTo': req.user.local.username }, function(err, followedtocount){
            if(user){

                res.render('widget/view-user-detail',{result: user,count:friendsdata,followedbycount:followedbycount,followedtocount:followedtocount});

            }else{
                res.send(err);
            }
        });
        });
        });
        });
    }else{
        res.json({null:'0'});
    }
});

/* Route for enabling and disabling user account */
router.post('/enable-disable-user-account', middleware.isAdminLoggedIn, function(req, res){
    var username = req.body.params.username;
    console.log('username: '+username);
    if(username != ""){
        User.findOne({'local.username': username},
        function (err, user) {
            if(user){
                var newStatus = true;
                if(user.enableAccount == true){
                    newStatus = false;
                }
                user.enableAccount = newStatus;
                user.save(function (err) {
                    if (err) {
                        res.json({'status':false,'enableAccount':newStatus,'message':err});
                    } else {
                        res.json({'status':true,'enableAccount':newStatus,'message':'User Information updated successfully!'});
                    }
                });
            }else{
                res.json({'status':false,'enableAccount':"",'message':err});
            }
        });
    }else{
        res.json({'status':false,'enableAccount':"",'message':'username is missing'});
    }
});

/* Route for List Products by Angular */
router.get('/get-products-list', middleware.isAdminLoggedIn, function(req, res){
    Products.aggregate([{$sort: {'product_added_date': 1}}], function (err, productsList) {
        if(productsList){
            res.json(productsList);
        }else{
            res.json({});
        }
    });
});

/* Route for List Brands by Angular */
router.get('/get-brands-list', middleware.isAdminLoggedIn, function(req, res){
    Brands.aggregate([{$sort: {'brand_added_date': 1}}], function (err, brandsList) {
        if(brandsList){
            res.json(brandsList);
        }else{
            res.json({});
        }
    });
});

/* Route delete user by Angular */
router.post('/delete-user/', middleware.isAdminLoggedIn, function (req, res) {
    var fs = require('fs.extra');
    User.findOne({'_id': req.body.uid}, function (err, user) {
        if (err) {
            res.send('error');
        }
        if (user) {
            user.remove(function (err) {
                if (!err) {
                    //fs.unlink('public/uploads/' + user.local.profileImage); // delete user profile image
                    res.send('success');
                } else {
                    res.send('error');
                }
            }); // end
        }
    });
});


// =========================================================================
// ======================== SHOP ROUTES =========================
// =========================================================================

// Admin section
router.get('/orders', middleware.check_login, function(req, res, next) {
    // Top 10 products
    req.db.orders.find({}).limit(10).sort({"order_date": -1}).exec(function (err, orders) {
        res.render('orders', {
            title: 'Cart',
            orders: orders,
            config: req.config.get('application'),
            session: req.session,
            message: middleware.clear_session_value(req.session, "message"),
            message_type: middleware.clear_session_value(req.session, "message_type"),
            helpers: req.handlebars.helpers,
            show_footer: "show_footer"
        });
    });
});

// render the editor
router.get('/order/view/:id', middleware.restrict, function(req, res) {

	req.db.orders.findOne({_id: req.params.id}, function (err, result) {
		res.render('order', {
			title: 'View order',
			"result": result,
            config: req.config.get('application'),
			session: req.session,
			message: middleware.clear_session_value(req.session, "message"),
			message_type: middleware.clear_session_value(req.session, "message_type"),
			editor: true,
			helpers: req.handlebars.helpers
		});
	});
});

// Admin section
router.get('/orders/filter/:search', middleware.restrict, function(req, res, next) {
	var search_term = req.params.search;
	var orders_index = req.orders_index;

	// we strip the ID's from the lunr index search
	var lunr_id_array = new Array();
	orders_index.search(search_term).forEach(function(id) {
		lunr_id_array.push(id.ref);
	});

	// we search on the lunr indexes
	req.db.orders.find({ _id: { $in: lunr_id_array}}, function (err, orders) {
		res.render('orders', {
			title: 'Order results',
            orders: orders,
            config: req.config.get('application'),
			session: req.session,
			search_term: search_term,
			message: middleware.clear_session_value(req.session, "message"),
			message_type: middleware.clear_session_value(req.session, "message_type"),
			helpers: req.handlebars.helpers,
			show_footer: "show_footer"
		});
	});
});


// order product
router.get('/order/delete/:id', middleware.restrict, function(req, res) {
  	var db = req.db;
	var orders_index = req.orders_index;

	// remove the article
	db.orders.remove({_id: req.params.id}, {}, function (err, numRemoved) {

		// remove the index
		orders_index.remove({id: req.params.id}, false);

		// redirect home
		req.session.message = "Order successfully deleted";
		req.session.message_type = "success";
		res.redirect('/admin/orders');
  	});
});

// update order status
router.post('/order/statusupdate', middleware.restrict, function(req, res) {
    var orderId = req.body.orderId;
    console.log("orderId : "+orderId);

    Orders.findOne({_id: orderId},  function (err, order) {
    Orders.update({_id: orderId},{$set: {order_status: req.body.frm_orderstatus} }, { multi: false }, function (err, orderInfo) {
        if(err){
            req.flash('message', '');
            req.flash('message_type','success');
            res.redirect('/admin/list-orders');
        }else{
             var firstName = order.order_firstname;
             var email     = order.order_email;
             var orderstatus = req.body.frm_orderstatus;
//            if(orderInfo.order_status == "Processing"){
//                var orderstatus = "Processed";
//            }
//            else if(orderInfo.order_status == "Pending"){
//                var orderstatus = "Processed";
//            }
//            else if(orderInfo.order_status == "Completed"){
//                var orderstatus = "Completed";
//            }
            var html = 'Hello '+firstName+',<br><br/><b>Your order with id "'+orderId+'" has been '+orderstatus+'.</b><br><br>';
                                    html += '<br>Thank you, Team Motorcycle';
            var emailBody = EmailTemplate.emailMessage(html);

            var mailOptions = {
                                    from   : "Motorcycle <no-reply@motorcycle.com>",
                                    to     :  email,
                                    subject: "Order Status",
                                    html   : emailBody
            };

            nodemailer.mail(mailOptions);

            req.flash('message', 'Status Successfully Updated!');
            req.flash('message_type','success');
            res.redirect('/admin/list-orders');
        }
    });
    });
});

// Admin section
router.post('/product/addtocart', function(req, res, next) {
    var _ = require('underscore');
    var product_quantity = req.body.product_quantity ? parseInt(req.body.product_quantity): 1;

    // setup cart object if it doesn't exist
    if(!req.session.cart){
        req.session.cart = {};
    }

	req.db.products.findOne({_id: req.body.product_id}).exec(function (err, product) {
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

// Updates a single product quantity
router.post('/product/updatecart', function(req, res, next) {
    var product_quantity = req.body.product_quantity ? req.body.product_quantity: 1;

    if(product_quantity == 0){
        // quantity equals zero so we remove the item
        delete req.session.cart[req.body.product_id];

        // update total cart amount
        middleware.update_total_cart_amount(req, res);
        res.status(200).json({message: 'Cart successfully updated', "total_cart_items": Object.keys(req.session.cart).length});
    }else{
        req.db.products.findOne({_id: req.body.product_id}).exec(function (err, product) {
            if(product){
                var product_price = parseFloat(product.product_price).toFixed(2);
                if(req.session.cart[req.body.product_id]){
                    req.session.cart[req.body.product_id]["quantity"] = product_quantity;
                    req.session.cart[req.body.product_id]["total_item_price"] = product_price * product_quantity;

                    // update total cart amount
                    middleware.update_total_cart_amount(req, res);
                    res.status(200).json({message: 'Cart successfully updated', "total_cart_items": Object.keys(req.session.cart).length});
                }else{
                    res.status(400).json({message: 'Error updating cart. Please try again', "total_cart_items": Object.keys(req.session.cart).length});
                }
            }else{
                res.status(400).json({message: 'Cart item not found', "total_cart_items": Object.keys(req.session.cart).length});
            }
        });
    }
});

// Remove single product from cart
router.post('/product/removefromcart', function(req, res, next) {
    delete req.session.cart[req.body.product_id];

    // update total cart amount
    middleware.update_total_cart_amount(req, res);
    res.status(200).json({message: 'Product successfully removed', "total_cart_items": 0});
});

// Totally empty the cart
router.post('/product/emptycart', function(req, res, next) {
    delete req.session.cart;
    delete req.session.order_id;

    // update total cart amount
    middleware.update_total_cart_amount(req, res);
    res.status(200).json({message: 'Cart successfully emptied', "total_cart_items": 0});
});

// Admin section
router.get('/products/filter/:search', middleware.restrict, function(req, res, next) {
	var search_term = req.params.search;
	var products_index = req.products_index;

	// we strip the ID's from the lunr index search
	var lunr_id_array = new Array();
	products_index.search(search_term).forEach(function(id) {
		lunr_id_array.push(id.ref);
	});

	// we search on the lunr indexes
	Products.find({ _id: { $in: lunr_id_array}}, function (err, results) {
		res.render('products', {
			title: 'Results',
			"results": results,
            config: req.config.get('application'),
			session: req.session,
			search_term: search_term,
			message: middleware.clear_session_value(req.session, "message"),
			message_type: middleware.clear_session_value(req.session, "message_type"),
			helpers: req.handlebars.helpers,
			show_footer: "show_footer"
		});
	});
});

// insert product form
router.get('/product/new', middleware.restrict, function(req, res) {

    //var catarray = [];
    Categories.find({ }, function (err, catresults) {

        Brands.find({ }, function (err, brandresults) {

            res.render('product_new', {
                title: 'New product',
                session: req.session,
                catresults:catresults,
                brandresults:brandresults,
                product_title: middleware.clear_session_value(req.session, "product_title"),
                product_description: middleware.clear_session_value(req.session, "product_description"),
                product_price: middleware.clear_session_value(req.session, "product_price"),
                product_permalink: middleware.clear_session_value(req.session, "product_permalink"),
                message: middleware.clear_session_value(req.session, "message"),
                message_type: middleware.clear_session_value(req.session, "message_type"),
                editor: true,
                user:req.user,
                active:'add-product'
            });
        });
    });
});
router.post('/product/removefromcart', function(req, res, next) {
    delete req.session.cart[req.body.product_id];

    // update total cart amount
    middleware.update_total_cart_amount(req, res);
    res.status(200).json({message: 'Product successfully removed', "total_cart_items": 0});
});

// Totally empty the cart
router.post('/product/emptycart', function(req, res, next) {
    delete req.session.cart;
    delete req.session.order_id;

    // update total cart amount
    middleware.update_total_cart_amount(req, res);
    res.status(200).json({message: 'Cart successfully emptied', "total_cart_items": 0});
});

// Admin section
router.get('/products/filter/:search', middleware.restrict, function(req, res, next) {
	var search_term = req.params.search;
	var products_index = req.products_index;

	// we strip the ID's from the lunr index search
	var lunr_id_array = new Array();
	products_index.search(search_term).forEach(function(id) {
		lunr_id_array.push(id.ref);
	});

	// we search on the lunr indexes
	Products.find({ _id: { $in: lunr_id_array}}, function (err, results) {
		res.render('products', {
			title: 'Results',
			"results": results,
            config: req.config.get('application'),
			session: req.session,
			search_term: search_term,
			message: middleware.clear_session_value(req.session, "message"),
			message_type: middleware.clear_session_value(req.session, "message_type"),
			helpers: req.handlebars.helpers,
			show_footer: "show_footer"
		});
	});
});

// insert product form
//router.get('/product/new', middleware.restrict, function(req, res) {
//    res.render('product_new', {
//        title: 'New product',
//        session: req.session,
//        product_title: middleware.clear_session_value(req.session, "product_title"),
//        product_description: middleware.clear_session_value(req.session, "product_description"),
//        product_price: middleware.clear_session_value(req.session, "product_price"),
//        product_permalink: middleware.clear_session_value(req.session, "product_permalink"),
//        message: middleware.clear_session_value(req.session, "message"),
//        message_type: middleware.clear_session_value(req.session, "message_type"),
//        editor: true,
//        user:req.user,
//        active:'add-product'
//    });
//});

// insert new product form action
var cpUpload = upload.fields([{name: 'upload_file', maxCount: 10}]);
router.post('/product/insert', cpUpload, middleware.restrict, function(req, res) {
     console.log("**********multiple  images upload**********");
     console.log(req.files['upload_file']);
     var imagesarray = req.files['upload_file'];
     var productimages = [];
     for(var img=0; img < imagesarray.length; img++){
           var imgname = imagesarray[img].filename;
           productimages.push(imgname);
     }
     console.log("*****Array images*****");
     console.log(productimages);
     //res.send("Multiple files uploaded");
    //console.log('product_category: '+product_category);
    //console.log('product_brand: '+product_brand);
    //console.log('product_size: '+product_size);
        Products.count({'product_permalink': req.body.frm_product_permalink}, function (err, product) {
        if(product > 0 && req.body.frm_product_permalink != ""){

            req.flash('message', globalConfig.productExists);
            req.flash('message_type','danger');
            // redirect to insert
            res.redirect('/admin/insert');
        }else{

            var product_category,product_brand,product_size = "";
            for (var key in req.body) {
                item = req.body[key];
                if(key.indexOf('frm_product_category') != -1){
                    product_category = item;
                }
                if(key.indexOf('frm_product_brand') != -1){
                    product_brand = item;
                }
                if(key.indexOf('frm_product_size') != -1){
                    product_size = item;
                }
            }
            console.log("sdsds : "+req.body.frm_product_featured);
            var productPrice = parseFloat(Math.round(req.body.frm_product_price * 100) / 100).toFixed(2);
            var productObj = new Products();
            productObj.product_permalink    = req.body.frm_product_permalink;
            productObj.product_title        = req.body.frm_product_title;
            productObj.product_price        = productPrice;
            productObj.product_description  = req.body.frm_product_description;
            productObj.product_short_description = req.body.frm_product_short_description;
            productObj.product_published    = req.body.frm_product_published;
            productObj.product_featured     = req.body.frm_product_featured;
            productObj.product_sku          = req.body.frm_product_sku;
            productObj.product_added_date   = new Date();
            productObj.product_rating       = 0;
            productObj.product_category     = product_category;
            productObj.product_brand        = product_brand;
            productObj.product_size         = product_size;
            productObj.product_image        = productimages;
            productObj.product_weight       = req.body.frm_product_weight;

            console.log('productObj: '+productObj);

            productObj.save(function (err) {
                if(err){
                    console.error("Error inserting document: " + err);
                    req.flash('message', globalConfig.productCreateError+' '+err);
                    req.flash('message_type','danger');
                    res.redirect('/admin/insert');
                }else{
                    req.flash('message', globalConfig.productCreateSuccess);
                    req.flash('message_type','success');
                    res.redirect('/admin/list-products');
                }
            });
        }
    });
});

// render the editor
router.get('/product/edit/:id', middleware.restrict, function(req, res) {
//	var db = req.db;
//        var classy = require("markdown-it-classy");
//	var markdownit = req.markdownit;
//	markdownit.use(classy);
    console.log("product id : "+req.params.id);
    //middleware.get_images(req.params.id, req, res, function (images){
        Products.findOne({_id: req.params.id}, function (err, result) {
            Categories.find({ }, function (err, catresults) {

                Brands.find({ }, function (err, brandresults) {
                    console.log(result);
                    res.render('product_edit', {
                        title: 'Edit product',
                        "result": result,
                        "catresults":catresults,
                        "brandresults":brandresults,
                       // images: images,
                        session: req.session,
                        message: middleware.clear_session_value(req.session, "message"),
                        message_type: middleware.clear_session_value(req.session, "message_type"),
                        editor: true,
                        user:req.user,
                        active:'add-product'
                    });
                });
            });
        });
    //});
});

// Update an existing product form action
//router.post('/product/update', middleware.restrict, function(req, res) {
//  	var db = req.db;
//	var products_index = req.products_index;
//
// 	Products.count({'product_permalink': req.body.frm_product_permalink, $not: { _id: req.body.frm_product_id }}, function (err, product) {
//		if(product > 0 && req.body.frm_product_permalink != ""){
//			// permalink exits
//			req.session.message = "Permalink already exists. Pick a new one.";
//			req.session.message_type = "danger";
//
//			// keep the current stuff
//			req.session.product_title = req.body.frm_product_title;
//			req.session.product_description = req.body.frm_product_description;
//			req.session.product_price = req.body.frm_product_price;
//			req.session.product_permalink = req.body.frm_product_permalink;
//            req.session.product_featured = req.body.frm_product_featured;
//
//			// redirect to insert
//			res.redirect('/edit/' + req.body.frm_product_id);
//		}else{
//			//db.products.findOne({_id: req.body.frm_product_id}, function (err, article) {
//            middleware.get_images(req.body.frm_product_id, req, res, function (images){
//                var product_doc = {
//                    product_title: req.body.frm_product_title,
//                    product_description: req.body.frm_product_description,
//                    product_published: req.body.frm_product_published,
//                    product_price: req.body.frm_product_price,
//                    product_permalink: req.body.frm_product_permalink,
//                    product_featured: req.body.frm_product_featured
//                }
//
//                // if no featured image
//                if(!product_doc.product_image){
//                    if(images.length > 0){
//                        product_doc["product_image"] = images[0].path;
//                    }else{
//                        product_doc["product_image"] = "/uploads/placeholder.png";
//                    }
//                }
//
//                Products.update({_id: req.body.frm_product_id},{ $set: product_doc}, {},  function (err, numReplaced) {
//                    if(err){
//                        console.error("Failed to save product: " + err)
//                        req.session.message = "Failed to save. Please try again";
//                        req.session.message_type = "danger";
//                        res.redirect('/edit/' + req.body.frm_product_id);
//                    }else{
//                        // create lunr doc
//                        var lunr_doc = {
//                            product_title: req.body.frm_product_title,
//                            product_description: req.body.frm_product_description,
//                            id: req.body.frm_product_id
//                        };
//
//                        // update the index
//                        products_index.update(lunr_doc, false);
//
//                        req.session.message = "Successfully saved";
//                        req.session.message_type = "success";
//                        res.redirect('/admin/product/edit/' + req.body.frm_product_id);
//                    }
//                });
//			});
//		}
//	});
//});
/*
 * Update product
 */
var cpUploadEditProduct = upload.fields([{name: 'product_edit_upload_file', maxCount: 10}]);
router.post('/product/update',cpUploadEditProduct, middleware.restrict, function(req, res) {
    var imagesarray = req.files['product_edit_upload_file'];
    var productimages = [];
    if(req.files['product_edit_upload_file']){
    for(var img=0; img < imagesarray.length; img++){
        var imgname = imagesarray[img].filename;
        productimages.push(imgname);
    }
    }
    Products.findOne({_id: req.body.frm_product_edit_id},  function (err, product) {
        var productimg = product.product_image;
        for(var i = 0; i < productimg.length; i++){
            productimages.push(productimg[i]);
        }

    var productPrice = parseFloat(Math.round(req.body.frm_product_edit_price * 100) / 100).toFixed(2);

    var product_doc = {
                    product_title: req.body.frm_product_edit_title,
                    product_category: req.body.frm_product_edit_category,
                    product_brand: req.body.frm_product_edit_brand,
                    product_size: req.body.frm_product_edit_size,
                    product_weight: req.body.frm_product_edit_weight,
                    product_sku: req.body.frm_product_edit_sku,
                    product_short_description: req.body.frm_product_edit_shortdesc,
                    product_description: req.body.frm_product_edit_longdesc,
                    product_published: req.body.frm_product_edit_published,
                    product_price: productPrice,
//                   product_permalink: req.body.frm_product_edit_permalink,
                    product_featured: req.body.frm_product_edit_featured,
                    product_image:productimages
    }

    Products.update({_id: req.body.frm_product_edit_id},{ $set: product_doc}, {},  function (err, numReplaced) {
    if(err){
            console.error("Failed to save product: " + err)
            req.session.message = "Failed to save. Please try again";
            req.session.message_type = "danger";
            res.redirect('/admin/product/edit/' + req.body.frm_product_edit_id);
    }else{
            req.flash('message', 'Product Updated Successfully!');
            req.flash('message_type','success');
            res.redirect('/admin/list-products');
        }
    });
    });

});

// delete product
router.get('/product/delete', middleware.restrict, function(req, res) {
      console.log("id: "+req.query.id);
      //res.send(true);
	// remove the article
	Products.remove({_id: req.query.id}, function (err, numRemoved) {
            if(err){
                req.flash('message', '');
                req.flash('message_type','success');
                res.redirect('/admin/list-products');
            }else{
                // remove the index
                // redirect home
                req.flash('message', 'Product Deleted Successfully!');
                req.flash('message_type','success');
                res.redirect('/admin/list-products');
            }
        });
});

// insert brand form
router.get('/brand/new', middleware.restrict, function(req, res) {
    res.render('brand_new', {
        title: 'New brand',
        session: req.session,
        brand_title: middleware.clear_session_value(req.session, "brand_title"),
        brand_description: middleware.clear_session_value(req.session, "brand_description"),
        brand_permalink: middleware.clear_session_value(req.session, "brand_permalink"),
        message: middleware.clear_session_value(req.session, "message"),
        message_type: middleware.clear_session_value(req.session, "message_type"),
        editor: true,
        user:req.user,
        active:'add-brand'
    });
});

// insert new brand form action
var cpUploadinsertbrand = upload.fields([{name: 'frm_brand_image', maxCount: 1}]);
router.post('/brand/insert',cpUploadinsertbrand, middleware.restrict, function(req, res) {
    var imagename="";
    if(req.files['frm_brand_image']){
        var imagearray = req.files['frm_brand_image'];
        console.log(imagearray);
        console.log(imagearray[0].filename);
        imagename = imagearray[0].filename;
    }

    Brands.count({'brand_permalink': req.body.frm_brand_permalink}, function (err, brand) {
        if(brand > 0 && req.body.frm_brand_permalink != ""){
            req.flash('message', globalConfig.brandExists);
            req.flash('message_type','danger');
            res.redirect('/admin/insert'); // redirect to insert
        }else{
            var brandObj                = new Brands();
            brandObj.brand_title        = req.body.frm_brand_title;
            brandObj.brand_permalink    = req.body.frm_brand_permalink;
            brandObj.brand_image        = imagename;
            brandObj.brand_description  = req.body.frm_brand_description;
            brandObj.brand_added_date   = new Date();

            console.log('brandObj: '+brandObj);
            brandObj.save(function (err) {
                if(err){
                    console.error("Error inserting document: " + err);
                    req.flash('message', globalConfig.brandCreateError+' '+err);
                    req.flash('message_type','danger');
                    res.redirect('/admin/insert');
                }else{
                    req.flash('message', globalConfig.brandCreateSuccess);
                    req.flash('message_type','success');
                    res.redirect('/admin/list-brands');
                }
            });
        }
    });
});

// users
router.get('/users', middleware.restrict, function(req, res) {
	req.db.users.find({}, function (err, users) {
		res.render('users', {
		  	title: 'Users',
			users: users,
			config: req.config.get('application'),
			is_admin: req.session.is_admin,
			helpers: req.handlebars.helpers,
			session: req.session,
			message: middleware.clear_session_value(req.session, "message"),
			message_type: middleware.clear_session_value(req.session, "message_type"),
		});
	});
});

// edit user
router.get('/user/edit/:id', middleware.restrict, function(req, res) {
	req.db.users.findOne({_id: req.params.id}, function (err, user) {

        // if the user we want to edit is not the current logged in user and the current user is not
        // an admin we render an access denied message
        if(user.user_email != req.session.user && req.session.is_admin == "false"){
            req.session.message = "Access denied";
            req.session.message_type = "danger";
            res.redirect('/Users/');
            return;
        }

		res.render('user_edit', {
		  	title: 'User edit',
			user: user,
			session: req.session,
			message: middleware.clear_session_value(req.session, "message"),
			message_type: middleware.clear_session_value(req.session, "message_type"),
            helpers: req.handlebars.helpers,
			config: req.config.get('application')
		});
	});
});

// update a user
router.post('/user/update', middleware.restrict, function(req, res) {
  	var db = req.db;
	var bcrypt = req.bcrypt;

    var is_admin = req.body.user_admin == 'on' ? "true" : "false";

    // get the user we want to update
    req.db.users.findOne({_id: req.body.user_id}, function (err, user) {
        // if the user we want to edit is not the current logged in user and the current user is not
        // an admin we render an access denied message
        if(user.user_email != req.session.user && req.session.is_admin == "false"){
            req.session.message = "Access denied";
            req.session.message_type = "danger";
            res.redirect('/admin/users/');
            return;
        }

        // create the update doc
        var update_doc = {};
        update_doc.is_admin = is_admin;
        update_doc.users_name = req.body.users_name;
        if(req.body.user_password){
            update_doc.user_password = bcrypt.hashSync(req.body.user_password);
        }

        db.users.update({ _id: req.body.user_id },
            {
                $set:  update_doc
            }, { multi: false }, function (err, numReplaced) {
            if(err){
                console.error("Failed updating user: " + err);
                req.session.message = "Failed to update user";
                req.session.message_type = "danger";
                res.redirect('/admin/user/edit/' + req.body.user_id);
            }else{
                // show the view
                req.session.message = "User account updated.";
                req.session.message_type = "success";
                res.redirect('/admin/user/edit/' + req.body.user_id);
            }
        });
    });
});

// insert a user
router.post('/user/insert', middleware.restrict, function(req, res) {
	var bcrypt = req.bcrypt;
	var url = require('url');

	// set the account to admin if using the setup form. Eg: First user account
	var url_parts = url.parse(req.header('Referer'));

	var is_admin = "false";
	if(url_parts.path == "/setup"){
		is_admin = "true";
	}

	var doc = {
        users_name: req.body.users_name,
        user_email: req.body.user_email,
		user_password: bcrypt.hashSync(req.body.user_password),
		is_admin: is_admin
	};

    // check for existing user
    req.db.users.findOne({'user_email': req.body.user_email}, function (err, user) {
        if(user){
            // user already exists with that email address
            console.error("Failed to insert user, possibly already exists: " + err);
            req.session.message = "A user with that email address already exists";
            req.session.message_type = "danger";
            res.redirect('/admin/user/new');
            return;
        }else{
            // email is ok to be used.
            req.db.users.insert(doc, function (err, doc) {
                // show the view
                if(err){
                    console.error("Failed to insert user: " + err);
                    req.session.message = "User exists";
                    req.session.message_type = "danger";
                    res.redirect('/admin/user/edit/' + doc._id);
                }else{
                    req.session.message = "User account inserted";
                    req.session.message_type = "success";

                    // if from setup we add user to session and redirect to login.
                    // Otherwise we show users screen
                    if(url_parts.path == "/setup"){
                        req.session.user = req.body.user_email;
                        res.redirect('/login');
                        return;
                    }else{
                        res.redirect('/admin/users');
                        return;
                    }
                }
            });
        }
    });
});

// users
router.get('/user/new', middleware.restrict, function(req, res) {
    req.db.users.findOne({_id: req.params.id}, function (err, user) {
		res.render('user_new', {
		  	title: 'User - New',
			user: user,
			session: req.session,
            helpers: req.handlebars.helpers,
            message: middleware.clear_session_value(req.session, "message"),
			message_type: middleware.clear_session_value(req.session, "message_type"),
			config: req.config.get('application')
		});
	});
});

// delete user
router.get('/user/delete/:id', middleware.restrict, function(req, res) {

	// remove the article
	if(req.session.is_admin == "true"){
		req.db.users.remove({_id: req.params.id}, {}, function (err, numRemoved) {
			req.session.message = "User deleted.";
			req.session.message_type = "success";
			res.redirect("/admin/users");
	  	});
	}else{
		req.session.message = "Access denied.";
		req.session.message_type = "danger";
		res.redirect("/admin/users");
	}
});

// validate the permalink
router.post('/api/validate_permalink', function(req, res){
	// if doc id is provided it checks for permalink in any products other that one provided,
	// else it just checks for any products with that permalink
	var query = {};
	if(req.body.doc_id == ""){
		query = {'product_permalink': req.body.permalink};
	}else{
		query = {'product_permalink': req.body.permalink, $not: { _id: req.body.doc_id }};
	}

	Products.count(query, function (err, products) {
		if(products > 0){
			res.writeHead(400, { 'Content-Type': 'application/text' });
			res.end('Permalink already exists');
		}else{
			res.writeHead(200, { 'Content-Type': 'application/text' });
			res.end('Permalink validated successfully');
		}
	});
});

// update the published state based on an ajax call from the frontend
router.post('/product/published_state', middleware.restrict, function(req, res) {
	Products.update({ _id: req.body.id}, { $set: { product_published: req.body.state} }, { multi: false }, function (err, numReplaced) {
		if(err){
			console.error("Failed to update the published state: " + err);
			res.writeHead(400, { 'Content-Type': 'application/text' });
			res.end('Published state not updated');
		}else{
			res.writeHead(200, { 'Content-Type': 'application/text' });
			res.end('Published state updated');
		}
	});
});

// set as main product image
router.post('/product/setasmainimage', middleware.restrict, function(req, res) {
    var fs = require('fs');
    var path = require('path');

    // update the product_image to the db
    Products.update({ _id: req.body.product_id}, { $set: { product_image: req.body.product_image} }, { multi: false }, function (err, numReplaced) {
        if(err){
            res.status(400).json({message: 'Unable to set as main image. Please try again.'});
        }else{
            res.status(200).json({message: 'Main image successfully set'});
        }
    });
});


// deletes a product image
router.post('/product/deleteimage', middleware.restrict, function(req, res) {
    var fs = require('fs');
    var path = require('path');

    // get the product_image from the db
    Products.findOne({_id: req.body.product_id}, function (err, product) {
        if(req.body.product_image == product.product_image){
            // set the produt_image to null
            Products.update({ _id: req.body.product_id}, { $set: { product_image: null} }, { multi: false }, function (err, numReplaced) {
                // remove the image from disk
                fs.unlink(path.join("public", req.body.product_image), function(err){
                    if(err){
                        res.status(400).json({message: 'Image not removed, please try again.'});
                    }else{
                        res.status(200).json({message: 'Image successfully deleted'});
                    }
                });
            });
        }else{
            // remove the image from disk
            fs.unlink(path.join("public", req.body.product_image), function(err){
                if(err){
                    res.status(400).json({message: 'Image not removed, please try again.'});
                }else{
                    res.status(200).json({message: 'Image successfully deleted'});
                }
            });
        }
    });
});

// upload the file
var multer  = require('multer')
var upload = multer({ dest: 'public/uploads/' });
router.post('/file/upload', middleware.restrict, upload.single('upload_file'), function (req, res, next) {
	var fs = require('fs');
    var path = require('path');

	if(req.file){
		// check for upload select
		var upload_dir = path.join("public/uploads", req.body.directory);

        // Check directory and create (if needed)
        middleware.check_directory_sync(upload_dir);

		var file = req.file;
		var source = fs.createReadStream(file.path);
		var dest = fs.createWriteStream(path.join(upload_dir, file.originalname.replace(/ /g,"_")));

		// save the new file
		source.pipe(dest);
		source.on("end", function() {});

		// delete the temp file.
		fs.unlink(file.path, function (err) {});

        // get the product form the DB
        Products.findOne({_id: req.body.directory}, function (err, product) {
            var image_path = path.join("/uploads", req.body.directory, file.originalname.replace(/ /g,"_"));

            // if there isn't a product featured image, set this one
            if(!product.product_image){
                Products.update({_id: req.body.directory},{$set: {product_image: image_path}}, { multi: false }, function (err, numReplaced) {
                    req.session.message = "File uploaded successfully";
                    req.session.message_type = "success";
                    res.redirect('/admin/product/edit/' + req.body.directory);
                });
            }else{
                req.session.message = "File uploaded successfully";
                req.session.message_type = "success";
                res.redirect('/admin/product/edit/' + req.body.directory);
            }
        });
	}else{
		req.session.message = "File upload error. Please select a file.";
		req.session.message_type = "danger";
		res.redirect('/admin/product/edit/' + req.body.directory);
	}
});

// delete a file via ajax request
router.post('/file/delete', middleware.restrict, function(req, res) {
	var fs = require('fs');

	req.session.message = null;
	req.session.message_type = null;

	fs.unlink("public/" + req.body.img, function (err) {
		if(err){
			console.error("File delete error: "+ err);
			res.writeHead(400, { 'Content-Type': 'application/text' });
            res.end('Failed to delete file: ' + err);
		}else{

			res.writeHead(200, { 'Content-Type': 'application/text' });
            res.end('File deleted successfully');
		}
	});
});

router.get('/files', middleware.restrict, function(req, res) {
	var glob = require("glob");
	var fs = require("fs");

	// loop files in /public/uploads/
	glob("public/uploads/**", {nosort: true}, function (er, files) {

		// sort array
		files.sort();

		// declare the array of objects
		var file_list = new Array();
		var dir_list = new Array();

		// loop these files
		for (var i = 0; i < files.length; i++) {

			// only want files
			if(fs.lstatSync(files[i]).isDirectory() == false){
				// declare the file object and set its values
				var file = {
					id: i,
					path: files[i].substring(6)
				};

				// push the file object into the array
				file_list.push(file);
			}else{
				var dir = {
					id: i,
					path: files[i].substring(6)
				};

				// push the dir object into the array
				dir_list.push(dir);
			}
		}

		// render the files route
		res.render('files', {
			title: 'Files',
			files: file_list,
			dirs: dir_list,
			session: req.session,
			config: req.config.get('application'),
			message: clear_session_value(req.session, "message"),
			message_type: clear_session_value(req.session, "message_type"),
		});
	});
});

/* category form */
router.get('/category/new', middleware.restrict, function(req, res) {
    res.render('category_new', {
        title: 'New category',
        session: req.session,
        message: middleware.clear_session_value(req.session, "message"),
        message_type: middleware.clear_session_value(req.session, "message_type"),
        editor: true,
        user:req.user,
        active:'add-category'
    });
});

// insert new category form action
router.post('/category/insert',  middleware.restrict, function(req, res) {
        console.log("title****** : "+req.body.frm_category_title);
        Categories.find({'category_title': req.body.frm_category_title}, function (err, category) {
        if(err){

            req.flash('message', globalConfig.productExists);
            req.flash('message_type','danger');
            // redirect to insert
            res.redirect('/admin/insert');
        }else{



           var categoryObj = new Categories();
            categoryObj.category_title        = req.body.frm_category_title;
            categoryObj.category_description  = req.body.frm_category_description;
            categoryObj.category_short_description = req.body.frm_category_short_description;
            categoryObj.category_added_date   = new Date();

            categoryObj.save(function (err) {
                if(err){
                    console.error("Error inserting document: " + err);
                    req.flash('message', globalConfig.productCreateError+' '+err);
                    req.flash('message_type','danger');
                    res.redirect('/admin/insert');
                }else{
                    req.flash('message', 'New category successfully created!');
                    req.flash('message_type','success');
                    res.redirect('/admin/list-categories');
                }
            });
        }
    });
});

/* Route for List categories by Angular */
router.get('/get-categories-list', middleware.restrict, function(req, res){
    Categories.aggregate(
                        [
                            {
                                $lookup:
                                        {
                                            from: "products",
                                            localField: "category_title",
                                            foreignField: "product_category",
                                            as: "item"
                                 }
                            },
                            {
                                $project : {
                                    '_id':1,
                                    'category_title': 1,
                                    'category_short_description':1,
                                    'category_description':1,
                                    'category_added_date': 1,
                                    "count": { $size:"$item.product_category"},
                                }
                            },
                            {
                                $sort: {'category_added_date': 1}
                            }
                        ], function (err, categoryList) {

                        if(categoryList){
                            console.log(categoryList);
                            res.json(categoryList);
                        }else{
                            res.json({});
                        }
    });
});

router.get('/list-categories', middleware.restrict, function(req, res){
    res.render('list-categories', {
        message : req.flash('message'),
        message_type : req.flash('message_type'),
        user : req.user,
        title:'Admin | List Categories',
        active:'list-category'
    });
});



/* Points management*/
router.get('/list-rproutespoints', middleware.restrict, function(req, res){
    res.render('list-rproutespoints', {
        message : req.flash('message'),
        message_type : req.flash('message_type'),
        user : req.user,
        title:'Admin | List Rproutes Points',
        active:'list-rproutepoint'
    });
});

router.get('/get-points-list', middleware.restrict, function(req, res){
    Points.aggregate([{$sort: {'route': 1}}], function (err, pointsList) {
        if(pointsList){
            res.json(pointsList);
        }else{
            res.json({});
        }
    });
});

router.get('/add-rproutespoints', middleware.restrict, function(req, res) {
    res.render('rproutepoints_new', {
        title: 'New Rproute Points',
        session: req.session,
        message: middleware.clear_session_value(req.session, "message"),
        message_type: middleware.clear_session_value(req.session, "message_type"),
        editor: true,
        user:req.user,
        active:'add-points'
    });
});

// insert new points route form action
router.post('/rproutepoints/insert',  middleware.restrict, function(req, res) {
        console.log("route****** : "+req.body.frm_point_route);
        Points.find({'route': req.body.frm_point_route}, function (err, rproutepoints) {
        if(err){

            req.flash('message', globalConfig.productExists);
            req.flash('message_type','danger');
            // redirect to insert
            res.redirect('/admin/insert');
        }else{


            var pointsObj = new Points();
            pointsObj.route                   = req.body.frm_point_route;
            pointsObj.numberofroutes          = req.body.frm_point_numberofroutes;
            pointsObj.totalDistance           = req.body.frm_point_totalDistance;
            pointsObj.pointsPerkm             = req.body.frm_point_pointsPerkm;
            pointsObj.pointsAddingfriend      = req.body.frm_point_pointsAddingfriend;
            pointsObj.pointsUsingappeveryday  = req.body.frm_point_pointsUsingappeveryday;
            pointsObj.bonusPoint              = req.body.frm_point_bonusPoint;
            pointsObj.nailStealingpoints      = req.body.frm_point_nailStealingpoints;
            pointsObj.nailExtrapoints         = req.body.frm_point_nailExtrapoints;
            pointsObj.oilStealingpoints       = req.body.frm_point_oilStealingpoints;
            pointsObj.oilExtrapoints          = req.body.frm_point_oilExtrapoints;
            pointsObj.carStealingpoints       = req.body.frm_point_carStealingpoints;
            pointsObj.carExtrapoints          = req.body.frm_point_carExtrapoints;
            pointsObj.policecarStealingpoints = req.body.frm_point_policecarStealingpoints;
            pointsObj.policecarExtrapoints    = req.body.frm_point_policecarExtrapoints;


            pointsObj.save(function (err) {
                if(err){
                    console.error("Error inserting document: " + err);
                    req.flash('message', globalConfig.productCreateError+' '+err);
                    req.flash('message_type','danger');
                    res.redirect('/admin/insert');
                }else{
                    req.flash('message', globalConfig.productCreateSuccess);
                    req.flash('message_type','success');
                    res.redirect('/admin/list-rproutespoints');
                }
            });
        }
    });
});

/* delete category from admin */
router.post('/delete-category/', middleware.restrict, function(req, res) {

	// remove the article
	 Categories.remove({ _id: req.body.uid } ,function(err, status){
            if(err){
              status = "error";
            }
            else{
                status = "success";
            }
            res.send(status);

        });
});

/* Route to show update category page */
router.get('/updatecategory', middleware.restrict, function(req, res) {
    //res.send(true);

    Categories.findOne({'_id': req.query.id}, function (err, categorydata) {
        if(categorydata){

            res.render('category_update', {
                title: 'Update category',
                categorydata : categorydata,
                session: req.session,
                message: middleware.clear_session_value(req.session, "message"),
                message_type: middleware.clear_session_value(req.session, "message_type"),
                editor: true,
                user:req.user,
                active:'add-category'
            });
        }
        else{
             console.log("vvcvcvc");
        }

    });

});

/*
 * Route to update category in database
 */
router.post('/category/update', middleware.restrict, function(req, res) {


    Categories.findOne({'_id': req.body.frm_category_id}, function (err, categorydata) {

        if(categorydata) {
        Categories.update({
                                '_id': req.body.frm_category_id
                            },
                            {
                                $set:   {
                                            'category_title': req.body.frm_category_title ,
                                            'category_short_description': req.body.frm_category_short_description ,
                                            'category_description':req.body.frm_category_description,
                                        }
                            },
                            { multi: true },
                function(err, categoryinfo){

                     if (err){

                    }else{
                        /* Update category title in product table */
                        if(req.body.frm_category_title != req.body.frm_hidden_category_title){
                        Products.update({ 'product_category': { $regex : new RegExp(req.body.frm_hidden_category_title, "i") } },{  $set:   {  'product_category': req.body.frm_category_title }},{ multi: true },function(err, productInfo){
                            if(err){
                                req.flash('message', '');
                                req.flash('message_type','success');
                                res.redirect('/admin/list-categories');
                            }else{
                                req.flash('message', 'Category Updated Successfully!');
                                req.flash('message_type','success');
                                res.redirect('/admin/list-categories');
                            }

                        });
                        }else{
                            req.flash('message', 'Category Updated Successfully!');
                            req.flash('message_type','success');
                            res.redirect('/admin/list-categories');

                        }
                    }
                });
        }
        else{
            console.log("error");
        }
    });

});


/* Route to show update brand page */
router.get('/updatebrand', middleware.restrict, function(req, res) {
    console.log("sdasdsd"+req.query.id);
    //res.send(true);

    Brands.findOne({'_id': req.query.id}, function (err, branddata) {
        if(branddata){
            console.log("qwqwffdf");
            res.render('brand_update', {
                title: 'Update Brand',
                branddata : branddata,
                session: req.session,
                message: middleware.clear_session_value(req.session, "message"),
                message_type: middleware.clear_session_value(req.session, "message_type"),
                editor: true,
                user:req.user,
                active:'add-brand'
            });
        }
        else{
             console.log("vvcvcvc");
        }

    });

});

/*
 *
 * Route to  update brand in database
 */
var cpUploadupdatebrand = upload.fields([{name: 'frm_brand_image', maxCount: 1}]);
router.post('/brand/update', cpUploadupdatebrand, middleware.restrict, function(req, res) {


    var imagename="";
    if(req.files['frm_brand_image']){
        var imagearray = req.files['frm_brand_image'];
        console.log(imagearray);
        console.log(imagearray[0].filename);
        imagename = imagearray[0].filename;
    }



    Brands.findOne({'_id': req.body.frm_brand_id}, function (err, branddata) {

        if(branddata) {
        Brands.update({
                                '_id': req.body.frm_brand_id
                            },
                            {
                                $set:   {
                                            'brand_featured': req.body.frm_brand_featured ,
                                            'brand_description':req.body.frm_brand_description,
                                            'brand_image':imagename
                                        }
                            },
                            { multi: true },
                function(err, brandinfo){

                     if (err){

                    }else{



                        console.log('update brands');
                        res.render('list-brands', {
                            message : 'Brands Updated Successfully!',
                            message_type : 'success',
                            user : req.user,
                            title:'Admin | List Brands',
                            active:'list-brands'
                        });


                    }
                });
        }
        else{

            console.log("error");
        }


    });

});

/* delete brand */
router.post('/delete-brand/', middleware.restrict, function(req, res) {

	// remove the article
	 Brands.remove({ _id: req.body.uid } ,function(err, status){
            if(err){
              status = "error";
            }
            else{
                status = "success";
            }
            res.send(status);

        });
});

/* Route for List event types */
router.get('/get-eventtypes-list', middleware.restrict, function(req, res){
    EventTypes.find({'event_type':{$ne:null}},{_id:1,event_type:1,eventtype_description:1,eventtype_added_date:1},function (err, eventtypesList) {
        if(eventtypesList){
            res.json(eventtypesList);
        }else{
            res.json({});
        }
    });
});

/* Points management*/
router.get('/list-eventtypes', middleware.restrict, function(req, res){
    res.render('list-eventtypes', {
        message : req.flash('message'),
        message_type : req.flash('message_type'),
        user : req.user,
        title:'Admin | List Event Types',
        active:'list-eventtypes'
    });
});

/*
 * Route to show add event type page
 */
router.get('/add-eventtype', middleware.restrict, function(req, res) {
    res.render('eventtype_new', {
        title: 'New event type',
        session: req.session,
        message: middleware.clear_session_value(req.session, "message"),
        message_type: middleware.clear_session_value(req.session, "message_type"),
        editor: true,
        user:req.user,
        active:'add-eventtype'
    });
});

/*
 * Route to insert new event type
 */
router.post('/eventtype/insert', middleware.restrict, function(req, res) {


    EventTypes.count({'event_type': req.body.frm_event_type}, function (err, eventtype) {
        if(eventtype > 0 && req.body.frm_event_type != ""){
            req.flash('message', "Event Type already exists");
            req.flash('message_type','danger');
            res.redirect('/admin/eventtypeinsert'); // redirect to insert
        }else{
            var eventtypeObj                    = new EventTypes();
            eventtypeObj.event_type             = req.body.frm_event_type;
            eventtypeObj.eventtype_description  = req.body.frm_eventtype_description;
            eventtypeObj.eventtype_added_date   = new Date();

            console.log('eventtypeObj: '+eventtypeObj);
            eventtypeObj.save(function (err) {
                if(err){
                    console.error("Error inserting document: " + err);
                    req.flash('message', err);
                    req.flash('message_type','danger');
                    res.redirect('/admin/eventtypeinsert');
                }else{
                    req.flash('message', 'Event Type created successfully!');
                    req.flash('message_type','success');
                    res.redirect('/admin/list-eventtypes');
                }
            });
        }
    });
});

/*
 * Route to show update event type page
 */
router.get('/updateeventtype',  middleware.restrict, function(req, res) {
    console.log("Update event type id : "+req.query.id);
    //res.send(true);


            EventTypes.findOne({'_id': req.query.id  },function (err, eventtype) {
                if(!err){
                    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                    res.render('eventtype_update', {
                        title: 'Update Event type',
                        eventtype : eventtype,
                        session: req.session,
                        message: '',
                        messageSuccess: '',
                        editor: true,
                        user:req.user,
                        active:'update-eventtype'
                    });
                }else{
                    console.log("Error while listing event type");
                }
            });


    });

/*
 * Route to update event type page
 */
router.post('/eventtype/update',  middleware.restrict, function (req, res){

        EventTypes.findOne({'_id': req.body.frm_event_type_id }, function (err, eventtypeinfo) {
            if (!eventtypeinfo) {

                res.redirect('/admin/updateeventtype');

            } else {

                eventtypeinfo.event_type     = req.body.frm_event_type;
                eventtypeinfo.eventtype_description     = req.body.frm_eventtype_description;

                eventtypeinfo.save(function (err) {
                    if (err) {

                         res.redirect('/list-eventtypes');

                    } else {

                        req.flash('message', 'Event Type updated successfully!');
                        req.flash('message_type','success');
                        res.redirect('/admin/list-eventtypes');

                    }
                });
            }
        });


});

/*
 * Route to delete event type
 */
router.post('/delete-eventtype/', middleware.restrict, function(req, res) {

	// remove the article
	 EventTypes.remove({ _id: req.body.uid } ,function(err, status){
            if(err){
              status = "error";
            }
            else{
                status = "success";
            }
            res.send(status);

        });
});

/*
 * Route to show list reviews page
 */
router.get('/list-reviews', middleware.restrict, function(req, res){
    res.render('list-reviews', {
        message : req.flash('message'),
        message_type : req.flash('message_type'),
        user : req.user,
        title:'Admin | List Reviews',
        active:'list-reviews'
    });
});

/*
 * Route to get reviews from database to show on list reviews page
 */
router.get('/get-reviews-list', middleware.restrict, function(req, res){
    Reviews.find({},function (err, reviewsList) {
        if(reviewsList){
            res.json(reviewsList);
        }else{
            res.json({});
        }
    });
});

/*
 * Route to update review in database
 */
router.get('/updatereview',  middleware.restrict, function (req, res){

        Reviews.findOne({'_id': req.query.id }, function (err, reviewinfo) {
            if (!reviewinfo) {

                res.redirect('/admin/list-reviews');

            } else {

                reviewinfo.ReviewStatus = "APPROVED";

                reviewinfo.save(function (err) {
                    if (err) {

                         res.redirect('/list-reviews');

                    } else {

                        req.flash('message', 'Review approved!');
                        req.flash('message_type','success');
                        res.redirect('/admin/list-reviews');

                    }
                });
            }
        });

});

/*
 * Route to delete review from database
 */
router.post('/delete-review/', middleware.restrict, function(req, res) {

	// remove the article
	 Reviews.remove({ _id: req.body.uid } ,function(err, status){
            if(err){
              status = "error";
            }
            else{
                status = "success";
            }
            res.send(status);

        });
});

/*
 * Route to show update user page in admin
 */
router.get('/update-user',  middleware.restrict, function(req, res) {

            User.findOne({'_id': req.query.id  },function (err, userdata) {
                if(!err){
                    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                    res.render('user_update', {
                        title: 'Update Event type',
                        userdata : userdata,
                        session: req.session,
                        message: '',
                        messageSuccess: '',
                        editor: true,
                        user:req.user,
                        active:'update-eventtype'
                    });
                }else{
                    console.log("Error while updating user");
                }
            });
});

/*
 * Route to update user and save in collection from admin
 */
router.post('/userupdate',  middleware.restrict, function (req, res){

        var accountenable = "";
        if(req.body.frm_user_accountenable == "true"){
            var accounttrue = true;
        }else if(req.body.frm_user_accountenable == "false"){
            var accounttrue = false;
        }

        User.findOne({'_id': req.body.frm_user_id }, function (err, userinfo) {
            if (!userinfo) {
                console.log("ssdfsf");
                res.redirect('/admin/list-users');

            } else {
                accountenable = userinfo.enableAccount;
                userinfo.local.firstName     = req.body.frm_user_firstname;
                userinfo.local.lastName      = req.body.frm_user_lastname;
                userinfo.local.gender        = req.body.frm_user_gender;
                userinfo.local.userLevel     = req.body.frm_user_userlevel;
                userinfo.local.userActive    = req.body.frm_user_useractive;
                userinfo.enableAccount       = req.body.frm_user_accountenable;


                userinfo.save(function (err,updateuserinfo) {
                    if (err) {

                        res.redirect('/admin/list-users');

                    } else {

                        if(accountenable != accounttrue){

                            var accountstatus = "";
                            if(updateuserinfo.enableAccount == true){
                                accountstatus = "Activated"
                            }else{
                                accountstatus = "Deactivated"
                            }
                            var html = 'Hello '+userinfo.local.firstName+', <br><br><b>Your rideprix account is '+accountstatus+'.</b><br>';

                            html += '<br>Thank you, Team Motorcycle';
                            var emailBody = EmailTemplate.emailMessage(html);
                            var mailOptions = {
                                from   : "Motorcycle <no-reply@motorcycle.com>",
                                to     :  userinfo.local.email,
                                subject: "Rideprix Account "+accountstatus,
                                html   : emailBody
                            };

                            nodemailer.mail(mailOptions); //send account status email to user
                        }
                        req.flash('message', 'User updated successfully!');
                        req.flash('message_type','success');
                        res.redirect('/admin/list-users');

                    }
                });
            }
        });


});

/*
 * Route to get all contacts requests
 */
router.get('/get-contacts-list', middleware.restrict, function(req, res){
    Contact.find({},function (err, contactList) {
        if(contactList){
            res.json(contactList);
        }else{
            res.json({});
        }
    });
});
/*
 * Route to get orders list from collections
 */
router.get('/get-order-list', middleware.restrict, function(req, res){

       Orders.aggregate(
                [


                    {
                        $lookup:
                                {
                                    from: "ordersproducts",
                                    localField: "_id",
                                    foreignField: "order_id",
                                    as: "item"
                         }
                    },
                    {
                        $project : {
                            '_id':1,
                            'order_firstname': 1,
                            'order_lastname':1,
                            'order_status':1,
                            'order_email': 1,
                            'order_total':1,
                            'ship_cost':1,
                            'tax_cost':1,
                            "count": { $size:"$item.order_id"},

                        }
                    }

                ]
                ,function (err, orderList) {
                if(orderList){

                       res.json(orderList);
                }
                else{

                   res.json({});

                }
            });
});

/* route to add tax */
router.get('/add-tax', middleware.restrict, function(req, res) {
    res.render('tax_new', {
        title: 'Tax',
        session: req.session,
        message: '',
        message_type: '',
        editor: true,
        user:req.user,
        active:'add-tax'
    });
});

/* route to add rider categories */
router.get('/ridercategory/new', middleware.restrict, function(req, res) {
    res.render('ridercategory_new', {
        title: 'New Rider Category',
        session: req.session,
        message: "",
        message_type: "",
        editor: true,
        user:req.user,
        active:'add-ridercategories'
    });
});

/*
* Route to insert new rider category in collection
*/
router.post('/ridercategory/insert', middleware.restrict, function(req, res) {
    var Ridercategory    = require('../models/ridercategory');
    Ridercategory.count({'categoryName': req.body.rider_category_name}, function (err, category) {
        if(category > 0 && req.body.rider_category_name != ""){
            req.flash('message', "Rider category name '"+req.body.rider_category_name+"' already exists");
            req.flash('message_type','danger');
            res.redirect('/admin/list-ridercategories'); // redirect to insert
        }else{
            var catObj          = new Ridercategory();
            catObj.categoryName = req.body.rider_category_name;
            catObj.save(function (err) {
                if(err){
                    req.flash('message', err);
                    req.flash('message_type','danger');
                    res.redirect('/admin/add-ridercategories');
                }else{
                    req.flash('message', 'Rider category created successfully!');
                    req.flash('message_type','success');
                    res.redirect('/admin/list-ridercategories');
                }
            });
        }
    });
});

/*
* Route to insert new rider category in collection
*/
router.post('/riderexperience/insert', middleware.restrict, function(req, res) {
    var Riderexperience    = require('../models/riderexperience');
    Riderexperience.count({'experienceName': req.body.rider_experience_name}, function (err, experience) {
        if(experience > 0 && req.body.rider_experience_name != ""){
            req.flash('message', "Rider experience name '"+req.body.rider_experience_name+"' already exists");
            req.flash('message_type','danger');
            res.redirect('/admin/list-riderexperiences'); // redirect to insert
        }else{
            var expObj          = new Riderexperience();
            expObj.experienceName = req.body.rider_experience_name;
            expObj.save(function (err) {
                if(err){
                    req.flash('message', err);
                    req.flash('message_type','danger');
                    res.redirect('/admin/add-riderexperiences');
                }else{
                    req.flash('message', 'Rider experience created successfully!');
                    req.flash('message_type','success');
                    res.redirect('/admin/list-riderexperiences');
                }
            });
        }
    });
});

/*
* Route to insert new rider category in collection
*/
router.post('/ridertype/insert', middleware.restrict, function(req, res) {
    var Ridertype    = require('../models/ridertype');
    Ridertype.count({'typeName': req.body.rider_type_name}, function (err, type) {
        if(type > 0 && req.body.rider_type_name != ""){
            req.flash('message', "Rider type name '"+req.body.rider_type_name+"' already exists");
            req.flash('message_type','danger');
            res.redirect('/admin/list-ridertypes'); // redirect to insert
        }else{
            var expObj          = new Ridertype();
            expObj.typeName = req.body.rider_type_name;
            expObj.save(function (err) {
                if(err){
                    req.flash('message', err);
                    req.flash('message_type','danger');
                    res.redirect('/admin/add-ridertype');
                }else{
                    req.flash('message', 'Rider type created successfully!');
                    req.flash('message_type','success');
                    res.redirect('/admin/list-ridertypes');
                }
            });
        }
    });
});

/* route to add rider experience */
router.get('/riderexperience/new', middleware.restrict, function(req, res) {
    res.render('riderexperience_new', {
        title: 'New Rider Experience',
        session: req.session,
        message: "",
        message_type: "",
        editor: true,
        user:req.user,
        active:'add-riderexperience'
    });
});

/* route to add rider type */
router.get('/ridertype/new', middleware.restrict, function(req, res) {
    res.render('ridertype_new', {
        title: 'New Rider Type',
        session: req.session,
        message: "",
        message_type: "",
        editor: true,
        user:req.user,
        active:'add-ridertype'
    });
});

/*
 * Route to insert new tax rule in collection
 */
router.post('/tax/insert', middleware.restrict, function(req, res) {


    Tax.count({'tax_country': req.body.frm_tax_country,'tax_state':req.body.frm_tax_state}, function (err, tax) {
        if(tax > 0 && req.body.frm_event_type != ""){
            req.flash('message', "Tax already exists");
            req.flash('message_type','danger');
            res.redirect('/admin/list-tax'); // redirect to insert
        }else{
            var taxObj                    = new Tax();
            taxObj.tax_country            = req.body.frm_tax_country;
            taxObj.tax_state              = req.body.frm_tax_state;
            taxObj.tax_price              = req.body.frm_tax;
            taxObj.addded_on              = new Date();

            console.log('taxObj: '+taxObj);
            taxObj.save(function (err) {
                if(err){
                    console.error("Error inserting document: " + err);
                    req.flash('message', err);
                    req.flash('message_type','danger');
                    res.redirect('/admin/add-tax');
                }else{
                    req.flash('message', 'Tax created successfully!');
                    req.flash('message_type','success');
                    res.redirect('/admin/list-tax');
                }
            });
        }
    });
});

/*
 * Route to show list tax page in admin
 */
router.get('/list-tax', middleware.restrict, function(req, res){
    res.render('list-tax', {
        message : req.flash('message'),
        message_type : req.flash('message_type'),
        user : req.user,
        title:'Admin | List Tax',
        active:'list-tax'
    });
});

/*
 * Route to show list rider category page in admin
 */
router.get('/list-ridercategories', middleware.restrict, function(req, res){
    res.render('list-ridercategories', {
        message : req.flash('message'),
        message_type : req.flash('message_type'),
        user : req.user,
        title:'Admin | List Rider category',
        active:'list-ridercategories'
    });
});

/*
 * Route to show list rider experiences page in admin
 */
router.get('/list-riderexperiences', middleware.restrict, function(req, res){
    res.render('list-riderexperiences', {
        message : req.flash('message'),
        message_type : req.flash('message_type'),
        user : req.user,
        title:'Admin | List Rider Experiences',
        active:'list-riderexperiences'
    });
});

/*
 * Route to show list rider ty page in admin
 */
router.get('/list-ridertypes', middleware.restrict, function(req, res){
    res.render('list-ridertypes', {
        message : req.flash('message'),
        message_type : req.flash('message_type'),
        user : req.user,
        title:'Admin | List Rider Types',
        active:'list-ridertypes'
    });
});

/*
 * Route to get tax list in admin
 */
router.get('/get-tax-list', middleware.restrict, function(req, res){
    Tax.find({},function (err, taxList) {
        if(taxList){
            res.json(taxList);
        }else{
            res.json({});
        }
    });
});

/*
 * Route to get rider categories list in admin
 */
router.get('/get-rider-categories-list', middleware.restrict, function(req, res){
    var Ridercategory    = require('../models/ridercategory');
    Ridercategory.find({},function (err, catList) {
        if(catList){
            res.json(catList);
        }else{
            res.json({});
        }
    });
});

/*
 * Route to get rider experiences list in admin
 */
router.get('/get-rider-experiences-list', middleware.restrict, function(req, res){
    var Riderexperience = require('../models/riderexperience');
    Riderexperience.find({},function (err, expList) {
        if(expList){
            res.json(expList);
        }else{
            res.json({});
        }
    });
});

/*
 * Route to get rider type list in admin
 */
router.get('/get-rider-types-list', middleware.restrict, function(req, res){
    var Ridertype = require('../models/ridertype');
    Ridertype.find({},function (err, typeList) {
        if(typeList){
            res.json(typeList);
        }else{
            res.json({});
        }
    });
});

/*
 * Route to show update tax info
 */
router.get('/updatetax',  middleware.restrict, function(req, res) {
    Tax.findOne({'_id': req.query.id  },function (err, tax) {
        if(!err){
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.render('tax_update', {
                title: 'Update Tax',
                tax : tax,
                session: req.session,
                message: '',
                messageSuccess: '',
                editor: true,
                user:req.user,
                active:'update-tax'
            });
        }else{
            console.log("Error while listing tax");
        }
    });
});

/*
 * Route to update tax from admin in collection
 */
router.post('/tax/update',  middleware.restrict, function (req, res){
    Tax.findOne({'_id': req.body.frm_tax_id }, function (err, taxinfo) {
        if (!taxinfo) {
            res.redirect('/admin/updatetax');
        } else {
            taxinfo.tax_country     = req.body.frm_tax_country;
            taxinfo.tax_state     = req.body.frm_tax_state;
            taxinfo.tax_price     = req.body.frm_tax;
            taxinfo.save(function (err) {
                if (err) {
                     res.redirect('/list-tax');
                } else {
                    req.flash('message', 'Tax updated successfully!');
                    req.flash('message_type','success');
                    res.redirect('/admin/list-tax');
                }
            });
        }
    });
});
/*
 * Route to delete tax from collection
 */
router.post('/delete-tax', middleware.restrict, function(req, res) {
	 Tax.remove({ _id: req.body.uid } ,function(err, status){
        if(err){
          status = "error";
        }else{
            status = "success";
        }
        res.send(status);
    });
});

/*
 * Route to show update tax info
 */
router.get('/update-rider-experience',  middleware.restrict, function(req, res) {
    var Riderexperience = require('../models/riderexperience');
    Riderexperience.findOne({'_id': req.query.id  },function (err, exp) {
        if(!err){
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.render('riderexperience_update', {
                title: 'Update Rider Experience',
                exp : exp,
                session: req.session,
                message: '',
                messageSuccess: '',
                editor: true,
                user:req.user,
                active:'update-rider-experience'
            });
        }else{
            console.log("Error while listing rider experiences");
        }
    });
});

/*
 * Route to update tax from admin in collection
 */
router.post('/rider-experience/update',  middleware.restrict, function (req, res){
    var Riderexperience = require('../models/riderexperience');
    Riderexperience.findOne({'_id': req.body.frm_exp_id }, function (err, expinfo) {
        if (!expinfo) {
            res.redirect('/admin/update-rider-experience');
        } else {
            expinfo.experienceName = req.body.frm_exp_name;
            expinfo.save(function (err) {
                if (err) {
                     res.redirect('/list-riderexperiences');
                } else {
                    req.flash('message', 'Experience updated successfully!');
                    req.flash('message_type','success');
                    res.redirect('/admin/list-riderexperiences');
                }
            });
        }
    });
});
/*
 * Route to delete tax from collection
 */
router.post('/delete-rider-experience', middleware.restrict, function(req, res) {
  var Riderexperience = require('../models/riderexperience');
	 Riderexperience.remove({ _id: req.body.uid } ,function(err, status){
        if(err){
          status = "error";
        }else{
          status = "success";
        }
        res.send(status);
    });
});


/* Route to add shipping */
router.get('/add-shipping', middleware.restrict, function(req, res) {
    res.render('shipping_new', {
        title: 'Shipping',
        session: req.session,
        message: '',
        message_type: '',
        editor: true,
        user:req.user,
        active:'add-shipping'
    });
});

/*
 * Route to insert new shipping rule  in collection
 */
router.post('/shipping/insert', middleware.restrict, function(req, res) {


    Shipping.count({'shipping_country': req.body.frm_shipping_country,'shipping_state':req.body.frm_shipping_state,'shipping_weightfrom':req.body.frm_shipping_weightfrom,'shipping_weightto':req.body.frm_shipping_weightto}, function (err, tax) {
        if(tax > 0 && req.body.frm_event_type != ""){
            req.flash('message', "Shipping already exists");
            req.flash('message_type','danger');
            res.redirect('/admin/list-shipping'); // redirect to insert
        }else{
            var shippingObj                    = new Shipping();
            shippingObj.shipping_country       = req.body.frm_shipping_country;
            shippingObj.shipping_state         = req.body.frm_shipping_state;
            shippingObj.shipping_price         = req.body.frm_shipping_cost;
            shippingObj.shipping_weightfrom    = req.body.frm_shipping_weightfrom;
            shippingObj.shipping_weightto      = req.body.frm_shipping_weightto;

            console.log('shippingObj: '+shippingObj);
            shippingObj.save(function (err) {
                if(err){
                    console.error("Error inserting document: " + err);
                    req.flash('message', err);
                    req.flash('message_type','danger');
                    res.redirect('/admin/add-shipping');
                }else{
                    req.flash('message', 'Shipping created successfully!');
                    req.flash('message_type','success');
                    res.redirect('/admin/list-shipping');
                }
            });
        }
    });
});

/*
 * Route to list shipping page in admin
 */
router.get('/list-shipping', middleware.restrict, function(req, res){
    res.render('list-shipping', {
        message : req.flash('message'),
        message_type : req.flash('message_type'),
        user : req.user,
        title:'Admin | List Shipping',
        active:'list-shipping'
    });
});

/*
 * Route to get shipping from collection
 */
router.get('/get-shipping-list', middleware.restrict, function(req, res){
    Shipping.find({},function (err, shippingList) {
        if(shippingList){
            res.json(shippingList);
        }else{
            res.json({});
        }
    });
});
/*
 * Route to show update shipping page
 */
router.get('/updateshipping',  middleware.restrict, function(req, res) {
    console.log("Update shipping id : "+req.query.id);
    //res.send(true);


            Shipping.findOne({'_id': req.query.id  },function (err, shipping) {
                if(!err){
                    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                    res.render('shipping_update', {
                        title: 'Update Shipping',
                        shipping : shipping,
                        session: req.session,
                        message: '',
                        messageSuccess: '',
                        editor: true,
                        user:req.user,
                        active:'update-Shipping'
                    });
                }else{
                    console.log("Error while listing shipping");
                }
            });


});

/*
 * Route to update shipping and save into database
 */
router.post('/shipping/update',  middleware.restrict, function (req, res){

        Shipping.findOne({'_id': req.body.frm_shipping_id }, function (err, shippinginfo) {
            if (!shippinginfo) {

                res.redirect('/admin/updateshipping');

            } else {

                shippinginfo.shipping_country    = req.body.frm_shipping_country;
                shippinginfo.shipping_state     = req.body.frm_shipping_state;
                shippinginfo.shipping_price     = req.body.frm_shipping_cost;
                shippinginfo.shipping_weightfrom   = req.body.frm_shipping_weightfrom;
                shippinginfo.shipping_weightto     = req.body.frm_shipping_weightto;

                shippinginfo.save(function (err) {
                    if (err) {

                         res.redirect('/list-shipping');

                    } else {

                        req.flash('message', 'Shipping updated successfully!');
                        req.flash('message_type','success');
                        res.redirect('/admin/list-shipping');

                    }
                });
            }
        });


});

/*
 * Route to delete shipping
 */
router.post('/delete-shipping', middleware.restrict, function(req, res) {

	// remove the article
	 Shipping.remove({ _id: req.body.uid } ,function(err, status){
            if(err){
              status = "error";
            }
            else{
                status = "success";
            }
            res.send(status);

        });
});

/*
 * get suggestions list to show in list suggestions tab
 */
router.get('/get-suggestions-list', middleware.restrict, function(req, res){
    Suggestion.find({},function (err, suggestionList) {
        if(suggestionList){
            res.json(suggestionList);
        }else{
            res.json({});
        }
    });
});
/*
 * response from admin to contact users
 */
router.post('/respond-contact', middleware.restrict, function(req, res) {
        var contactRespondMessage = req.body.contactRespondMessage;
        var status = "";

	Contact.findOne({ _id: req.body.contactId } ,function(err, contactInfo){
            if(err){
              status = "error";
            }
            else{
                console.log("email : "+contactInfo.contactEmail);
                Contact.update({ _id: req.body.contactId}, { $set: { respondStatus: 'respond'} }, { multi: false }, function (err, updateContact) {
                    if(err){
                        status = "error";
                    }else{
                            var html = 'Hello '+contactInfo.contactName+',<br>'+req.body.contactRespondMessage+'<br><br>';
                                        html += '<br>Thank you, Team Motorcycle';
                            var emailBody = EmailTemplate.emailMessage(html);
                            var mailOptions = {
                                        from   : "Motorcycle <no-reply@motorcycle.com>",
                                        to     : contactInfo.contactEmail,
                                        subject: "Response from Rideprix",
                                        html   : emailBody
                            };

                        nodemailer.mail(mailOptions); //send response email to customer from admin
                    }
                    });

                // status = "success";
                // res.send(status);
                req.flash('message', 'Your message has been sent successfully!');
                req.flash('message_type','success');
                res.redirect('/admin/list-contact-requests');
            }
            //res.send(status);

        });
});

/*
 * Suggestion Response from admin to cutomer
 */
router.post('/respond-suggestion', middleware.restrict, function(req, res) {
        var suggestionRespondMessage = req.body.suggestionRespondMessage;
        var status = "";

	Suggestion.findOne({ _id: req.body.suggestionId } ,function(err, suggestionInfo){
            if(err){
              status = "error";
            }
            else{


                Suggestion.update({ _id: req.body.suggestionId}, { $set: { respondStatus: 'respond'} }, { multi: false }, function (err, suggestionUpdate) {
                    if(err){
                         status = "error";
                    }else{
                        var html = 'Hello '+suggestionInfo.suggestionName+',<br>'+req.body.suggestionRespondMessage+'<br><br>';
                                    html += '<br>Thank you, Team Motorcycle';
                        var emailBody = EmailTemplate.emailMessage(html);
                        var mailOptions = {
                                    from   : "Motorcycle <no-reply@motorcycle.com>",
                                    to     :  suggestionInfo.suggestionEmail,
                                    subject: "Response from Rideprix",
                                    html   : emailBody
                        };

                        nodemailer.mail(mailOptions);

                    }

                });

                req.flash('message', 'Your message has been sent successfully!');
                req.flash('message_type','success');
                res.redirect('/admin/list-suggestions');


            }


        });
});

/*
 * View order detail page to show shipping and product info
 */
router.get('/view-order-detail/:id', middleware.isAdminLoggedIn, function(req, res){
    var orderId = req.params.id;
    res.render('view-orderdetail', {
        user : req.user,
        orderId : orderId,
        title:'Admin | View Order Detail',
        active:'view-orderdetail'
    });
});

/*
 * get data for View order detail page shipping and product info
 */
router.post('/view-order-detail', middleware.isAdminLoggedIn, function(req, res){
    var order_id = req.body.params.order_id;
    console.log('order_id: '+order_id);
    if(order_id != ""){

          Orders.aggregate(
                [
                    {
                        $match:{_id: mongoose.Types.ObjectId(order_id) }
                    },

                    {
                        $lookup:
                                {
                                    from: "ordersproducts",
                                    localField: "_id",
                                    foreignField: "order_id",
                                    as: "item"
                         }
                    },
                    {
                        $lookup:
                                {
                                    from: "ordershippings",
                                    localField: "_id",
                                    foreignField: "order_id",
                                    as: "item1"
                         }
                    },
                    //{ "$unwind": "$item" },
                    {
                        $project : {
                            '_id':1,
                            'order_firstname': 1,
                            'order_lastname':1,
                            'order_status':1,
                            'order_email': 1,
                            'order_total':1,
                            'order_addr1':1,
                            'order_addr2':1,
                            'order_city':1,
                            'order_state':1,
                            'order_country':1,
                            'order_postcode':1,
                            'order_total':1,
                            'order_date':1,
                            'ship_cost':1,
                            'tax_cost':1,
                            "count": { $size:"$item.order_id"},
                            'item1':"$item1",
                            'item':"$item",


                        }
                    },

                ]
                ,function (err, orderDetail) {
                if(orderDetail){
                       console.log(JSON.stringify(orderDetail));
                        console.log(JSON.stringify(orderDetail[0].item));

                       res.render('widget/view-order-detail',{result: orderDetail,products:orderDetail[0].item});
                }
                else{
                   res.json({});
                }
            });



    }else{
        res.json({null:'0'});
    }
});

/*
 * Delete product image
 */
router.post('/delete-productimage', middleware.isAdminLoggedIn, function(req, res){

    console.log("image id : "+req.body.params.imageName);
    console.log("productId : "+req.body.params.productId);

    Products.update({_id: req.body.params.productId},  { $pull: { 'product_image':req.body.params.imageName} }, {},  function (err, numReplaced) {
    if(err){
             res.json("error");

    }else{
           res.json("success");
        }
    });
    //res.send(true);
});

module.exports = router;
