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

/* Route for List Users */
router.get('/list-users', middleware.isAdminLoggedIn, function(req, res){
    res.render('list-users', { user : req.user, title:'Admin | List Users',active:'list-users'});
});

/* Route for List Products */
router.get('/list-products', middleware.isAdminLoggedIn, function(req, res){
    res.render('list-products', { user : req.user, title:'Admin | List Products',active:'list-products'});
});

/* Route for  List Orders */
router.get('/list-orders', middleware.isAdminLoggedIn, function(req, res){
    res.render('list-orders', { user : req.user, title:'Admin | List Orders',active:'list-orders'});
});

/* Route for List Contact Requests */
router.get('/list-contact-requests', middleware.isAdminLoggedIn, function(req, res){
    res.render('list-contact-requests', { user : req.user, title:'Admin | List Contact Requests',active:'list-contact-requests'});
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
module.exports = router;
