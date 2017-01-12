/*Initialized required modules and models*/
var express     = require('express');
var path        = require('path');
var favicon     = require('serve-favicon');
var logger      = require('morgan');
var cookieParser = require('cookie-parser');

var flash       = require('connect-flash');
var mongoose    = require('mongoose');
var multer      = require('multer');
var engine      = require('ejs-locals');
var debug       = require('debug')('Motorcycle:server');
var passport    = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var routes      = require('./routes/index');
var api         = require('./routes/api');
var product     = require('./routes/product');
var admin       = require('./routes/admin');
var User        = require('./models/user');
var fs          = require('fs.extra');
var dbConfig    = require('./config/database.js');
var appConfig   = require('./config/appconfig.js');

var app         = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        var extension;
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
        cb(null, req.user.local.username + '.' + extension); //Appending .jpg
    }
});
var upload = multer({storage: storage});

require('./config/passport')(passport); // pass passport for configuration
// view engine setup
app.engine('ejs', engine);
//app.set('views', path.join(__dirname, '/frontend'));
app.set('views', [__dirname + '/views/frontend', __dirname + '/views/backend']);
//app.set('views', path.join(__dirname, 'backend'));
app.set('view engine', 'ejs');
app.set('case sensitive routing', true);
app.use(flash());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'assets', 'logo.png')));
app.use(logger('dev'));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'node_modules')));
app.use('/', express.static(path.join(__dirname, 'public')));

var cpUpload = upload.fields([{name: 'userPhoto', maxCount: 1}]);

app.use('/admin', admin);
app.use('/product', product);
app.use('/api', api);
app.use('/', routes);

mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title:'404',
            user:req.user
        });
    });
}

//GET Request:
app.get('/', function (req, res) {
    req.on('close', function () {
        console.log('~~~~~~~~~~~~~~~~~~~~~~ Client closed the connection ~~~~~~~~~~~~~~~~~~~~~~');
    });
});

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title:'404',
        user:req.user
    });
});

var port = normalizePort(process.env.PORT || '2286');
app.set('port', port);

var server = require('http').createServer(app);
var serverListener = server.listen(port, function () {
    console.log("app is running on port: %d", serverListener.address().port);
});

server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    var bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
