var express   = require('express');
var passport  = require('passport');
var User      = require('../models/user');
var router    = express.Router();
var bodyParser  = require('body-parser');

/* Route for showing product detail page */
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

module.exports = router;
