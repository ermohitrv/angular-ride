var mongoose                = require('mongoose');
var bcrypt                  = require('bcrypt-nodejs');
var genders                 = 'MALE FEMALE OTHER'.split(' ');
var userLevel               = 'NORMAL ADMIN'.split(' ');
var userActive              = 'ACTIVE INACTIVE'.split(' ');
var featuredMode            = 'true false'.split(' ');

//ride config variables
var rideType                = 'Squid Mechanic Brand-loyalist Adventure-rider Exclusive-sport-rider Exclusive-cruiser-rider Stunter Philosopher'.split(' ');
var rideExperience          = 'Novice Intermediate Expert'.split(' ');
var rideCategory            = 'SuperSport Cruiser Dual Sport Touring Scooter'.split(' ');

var userSchema = mongoose.Schema({
    local: {
        firstName:      {type: String, default: ''},
        lastName:       {type: String, default: ''},
        email:          {type: String, default: ''},
        contact:        {type: String, default: ''},
        username:       {type: String, default: ''},
        password:       {type: String, default: ''},
        userLevel:      {type: String, enum: userLevel},
        dob:            {type: String, default: ''},
        userActive:     {type: String, enum: userActive},
        profileImage:   {type: String, default: '', maxlength: 250},
        gender:         {type: String, enum: genders},
        locationZipcode:{type: String, default: ''},
        locationCity:   {type: String, default: ''},
        locationState:  {type: String, default: ''},
        locationCountry:{type: String, default: ''},
        locationLat:    {type: String, default: ''},
        locationLng:    {type: String, default: ''},
        token:          {type: String, default: ''}      //for forgot password functionality
    },
    
    rideType:           {type: String, default: ''},
    rideExperience:     {type: String, default: ''},
    rideCategory:       {type: String, default: ''},
    
    lastActivityTime:   {type: Date, default: Date.now()},

    //text message settings fields
    featured:                   {type: String,enum: featuredMode,default: false},
    accountCreationDate:        {type: Date, default: Date.now()},
    
    //fields to show data only for user profile purpose
    userBio:                    {type: String, default: ''},
    facebookURL:                {type: String, default: ''},
    twitterURL:                 {type: String, default: ''},
    websiteURL:                 {type: String, default: ''},
    instagramURL:               {type: String, default: ''},
    skypeUsername:              {type: String, default: ''},
    youtubeURL:                 {type: String, default: ''},
    enableAccount:              {type: Boolean, default: true}, // true: enable, false: disable

    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }
//    twitter          : {
//        id           : String,
//        token        : String,
//        displayName  : String,
//        username     : String
//    },
//    google           : {
//        id           : String,
//        token        : String,
//        email        : String,
//        name         : String
//    }

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('user', userSchema);
