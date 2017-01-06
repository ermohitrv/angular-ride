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
router.get('/dashboard', middleware.isAdminLoggedIn, function(req, res){
    res.send('admin dashboard');
    //res.render('admin-dashboard', { user : req.user,title:'Admin Dashboard' });
});

module.exports = router;
