// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'        : '1624372031202122', // your App ID
        'clientSecret'    : 'db55897a815b7d440644efe084d542f9', // your App Secret
        'callbackURL'     : 'http://159.203.58.255:2286/auth/facebook/callback',
        'profileURL'      : 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email'

    },

//    'twitterAuth' : {
//        'consumerKey'        : 'your-consumer-key-here',
//        'consumerSecret'     : 'your-client-secret-here',
//        'callbackURL'        : 'http://localhost:8080/auth/twitter/callback'
//    },

    'googleAuth' : {
        'clientID'         : '897888940930-abh4idj91e9b0klrgfa19iv63g93kdq8.apps.googleusercontent.com',
        'clientSecret'     : 'zI-QqKTYWr5CuAafHWMd4Ag2',
        'callbackURL'      : 'http://localhost:2286/auth/google/callback'
    }

};
