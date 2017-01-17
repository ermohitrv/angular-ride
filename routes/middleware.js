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
        }
        if( req.session.adminId !== null && req.session.adminId !== undefined ) {
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
    }
};