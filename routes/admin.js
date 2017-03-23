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
    res.render('list-orders', { user : req.user, title:'Admin | List Orders',active:'list-orders'});
});

/* Route for List Contact Requests */
router.get('/list-contact-requests', middleware.isAdminLoggedIn, function(req, res){
    res.render('list-contact-requests', { user : req.user, message : req.flash('message'),message_type : req.flash('message_type'), title:'Admin | List Contact Requests',active:'list-contact-requests'});
});

/* Route for List Suggestions */
router.get('/list-suggestions', middleware.isAdminLoggedIn, function(req, res){
    res.render('list-suggestions', { user : req.user, title:'Admin | List Suggestions',active:'list-suggestions'});
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
    Brands.find({'brand_title':{$ne:null}},{_id:1,brand_title:1,brand_description:1,brand_added_date:1},function (err, brandsList) {
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
                    fs.unlink('public/uploads/' + user.local.profileImage); // delete user profile image
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
	var orders_index = req.orders_index;

    req.db.orders.update({_id: req.body.order_id},{$set: {order_status: req.body.status} }, { multi: false }, function (err, numReplaced) {
        res.status(200).json({message: 'Status successfully updated'});
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
router.get('/product/new', middleware.restrict, function(req, res) {
    res.render('product_new', {
        title: 'New product', 
        session: req.session,
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

// insert new product form action
/*router.post('/product/insert',  middleware.restrict, function(req, res) {
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
            
            var productObj = new Products();
            productObj.product_permalink    = req.body.frm_product_permalink;
            productObj.product_title        = req.body.frm_product_title;
            productObj.product_price        = req.body.frm_product_price;
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
});*/

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
            
            var productObj = new Products();
            productObj.product_permalink    = req.body.frm_product_permalink;
            productObj.product_title        = req.body.frm_product_title;
            productObj.product_price        = req.body.frm_product_price;
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
	var db = req.db;
        var classy = require("markdown-it-classy");
	var markdownit = req.markdownit;
	markdownit.use(classy);

    middleware.get_images(req.params.id, req, res, function (images){
        Products.findOne({_id: req.params.id}, function (err, result) {
            res.render('product_edit', { 
                title: 'Edit product', 
                "result": result,
                images: images,          
                session: req.session,
                message: middleware.clear_session_value(req.session, "message"),
                message_type: middleware.clear_session_value(req.session, "message_type"),
                //config: req.config.get('application'),
                editor: true,
                user:req.user,
                active:'add-product'
                //helpers: req.handlebars.helpers
            });
        });
    });
});

// Update an existing product form action
router.post('/product/update', middleware.restrict, function(req, res) {
  	var db = req.db;
	var products_index = req.products_index;
 
 	Products.count({'product_permalink': req.body.frm_product_permalink, $not: { _id: req.body.frm_product_id }}, function (err, product) {
		if(product > 0 && req.body.frm_product_permalink != ""){
			// permalink exits
			req.session.message = "Permalink already exists. Pick a new one.";
			req.session.message_type = "danger";
			
			// keep the current stuff
			req.session.product_title = req.body.frm_product_title;
			req.session.product_description = req.body.frm_product_description;
			req.session.product_price = req.body.frm_product_price;
			req.session.product_permalink = req.body.frm_product_permalink;
            req.session.product_featured = req.body.frm_product_featured;
				
			// redirect to insert
			res.redirect('/edit/' + req.body.frm_product_id);
		}else{
			//db.products.findOne({_id: req.body.frm_product_id}, function (err, article) {
            middleware.get_images(req.body.frm_product_id, req, res, function (images){
                var product_doc = {
                    product_title: req.body.frm_product_title,
                    product_description: req.body.frm_product_description,
                    product_published: req.body.frm_product_published,
                    product_price: req.body.frm_product_price,
                    product_permalink: req.body.frm_product_permalink,
                    product_featured: req.body.frm_product_featured
                }
                
                // if no featured image
                if(!product_doc.product_image){
                    if(images.length > 0){
                        product_doc["product_image"] = images[0].path;
                    }else{
                        product_doc["product_image"] = "/uploads/placeholder.png";
                    }
                }
                
                Products.update({_id: req.body.frm_product_id},{ $set: product_doc}, {},  function (err, numReplaced) {
                    if(err){
                        console.error("Failed to save product: " + err)
                        req.session.message = "Failed to save. Please try again";
                        req.session.message_type = "danger";
                        res.redirect('/edit/' + req.body.frm_product_id);
                    }else{
                        // create lunr doc
                        var lunr_doc = { 
                            product_title: req.body.frm_product_title,
                            product_description: req.body.frm_product_description,
                            id: req.body.frm_product_id
                        };
                        
                        // update the index
                        products_index.update(lunr_doc, false);
                        
                        req.session.message = "Successfully saved";
                        req.session.message_type = "success";
                        res.redirect('/admin/product/edit/' + req.body.frm_product_id);
                    }
                });
			});
		}
	});
});

// delete product
router.get('/product/delete/:id', middleware.restrict, function(req, res) {
    var rimraf = require('rimraf');
	var products_index = req.products_index;
	
	// remove the article
	Products.remove({_id: req.params.id}, {}, function (err, numRemoved) {      
        // delete any images and folder
            rimraf("public/uploads/" + req.params.id, function(err) {

                // create lunr doc
                var lunr_doc = { 
                    product_title: req.body.frm_product_title,
                    product_description: req.body.frm_product_description,
                    id: req.body.frm_product_id
                };

                // remove the index
                products_index.remove(lunr_doc, false);

                // redirect home
                req.session.message = "Product successfully deleted";
                req.session.message_type = "success";
                res.redirect('/admin/list-products');
            });
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
    Categories.aggregate([{$sort: {'category_added_date': 1}}], function (err, categoryList) {
        if(categoryList){
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

/* update category */
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


router.post('/category/update', middleware.restrict, function(req, res) {
    
   
    
    Categories.findOne({'_id': req.body.frm_category_id}, function (err, categorydata) {
        
        if(categorydata) {
        Categories.update({ 
                                '_id': req.body.frm_category_id
                            },
                            { 
                                $set:   { 
                                            'category_short_description': req.body.frm_category_short_description ,
                                            'category_description':req.body.frm_category_description,
                                        } 
                            },
                            { multi: true },
                function(err, categoryinfo){

                     if (err){
                       
                    }else{
                        
                        console.log('update category');
                         res.render('list-categories', { 
                            message : 'Category Updated Successfully!',
                            message_type : 'success',
                            user : req.user, 
                            title:'Admin | List Categories',
                            active:'list-category'
                        });
                        
                        
                    }
                });
        }
        else{
            
            console.log("error");
        }
       

    });

});


/* update category */
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

router.get('/list-reviews', middleware.restrict, function(req, res){
    res.render('list-reviews', { 
        message : req.flash('message'),
        message_type : req.flash('message_type'),
        user : req.user, 
        title:'Admin | List Reviews',
        active:'list-reviews'
    });
});

router.get('/get-reviews-list', middleware.restrict, function(req, res){
    Reviews.find({},function (err, reviewsList) {
        if(reviewsList){
            res.json(reviewsList);
        }else{
            res.json({});
        }
    });
});

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


router.post('/userupdate',  middleware.restrict, function (req, res){
        console.log(req.body.frm_user_firstname);
        console.log(req.body.frm_user_lastname);
         console.log(req.body.frm_user_gender);
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
                        console.log("aaaaa"+err);
                        res.redirect('/admin/list-users');
                         
                    } else {
                        console.log("nnnnn");
                        console.log("accounttrue"+accounttrue);
                        console.log("accountenable"+accountenable);
                        if(accountenable != accounttrue){
                            console.log("enter email");
                             console.log("enter email"+userinfo.local.email);
                            var accountstatus = "";
                            if(updateuserinfo.enableAccount == true){
                                accountstatus = "Activated"
                            }else{
                                accountstatus = "Deactivated"
                            }
                            var html = 'Hello '+userinfo.local.firstName+', <br><br><b>Your rideprix account is '+accountstatus+'.</b><br>';
                            
                            html += '<br>Thank you, Team Motorcycle';

                            var mailOptions = {
                                from   : "Motorcycle <no-reply@motorcycle.com>", 
                                to     :  'preeti_dev@rvtechnologies.co.in',
                                subject: "Rideprix Account "+accountstatus,
                                html   : html
                            };

                            nodemailer.mail(mailOptions);
                        }    
                        req.flash('message', 'User updated successfully!');
                        req.flash('message_type','success');
                        res.redirect('/admin/list-users');
                            
                    }
                });
            }
        });
    
    
});
    
    
router.get('/get-contacts-list', middleware.restrict, function(req, res){
    Contact.find({},function (err, contactList) {
        if(contactList){
            res.json(contactList);
        }else{
            res.json({});
        }
    });
});

module.exports = router;
