var randomString = function() {
    var length = 32;
    var chars  = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
};

//var websiteUrl = 'http://localhost:2286';
var websiteUrl = 'http://www.rideprix.com:2286';
module.exports = {
    //error messages
    wrongPassword     : 'Oops! Wrong password.',
    noUserFound       : 'No user found.',
    inActiveAccount   : 'Oops! Your Account is Inactive, try again later.',
    emailExists       : 'That email is already taken.',
//    frontendSignupDisabled : 'Sorry, Registrations are closed. Please check back later!',

    randomString      : randomString(),
    
    //signup email configs
    signupEmailSubject : 'Signup on Motorcycle',
    
    //success messages
    successRegister   : 'Congrats! You are successfully registered to Motorcycle',
    successImageUpload: 'Your Image uploaded successfully!',
    
    //signup email message
    signUpEmailMessageHeader: '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link href="https://fonts.googleapis.com/css?family=Open+Sans:400,300,300italic,400italic,600,600italic,700" rel="stylesheet" type="text/css"><title>Motorcycle SignUp</title><style type="text/css"> body{ margin:0; padding:0;}</style></head><body><table cellpadding="0" style="border: 1px solid #dcdcdc;max-width:100%;font-family: "Open Sans", sans-serif; width:1200px; margin:0 auto;"><tbody><tr><td><table cellpadding="0" bgcolor="#557da1" width="100%"><tbody><tr><td><h3 style="text-align:center;"><img alt="Motorcycle" title="Motorcycle" src="'+websiteUrl+'/public/images/resize_logo_full.png"></h3></td></tr></tbody></table></td></tr>',
    signUpEmailMessageFooter: '<tr><td><p style="font-size:20px; text-align:left; font-family:Open Sans; color:#4a4a4c; margin-left: 10%; margin-right: 10%;  font-weight:400;">Thanks,<br>Team Motorcycle</p></td></tr><tr><td><table cellpadding="0" bgcolor="#d9edf7" width="100%"><tbody><tr><td><h3 style="text-transform:uppercase; font-size:20px; color:#49494b; font-weight:400; text-align:center;">CONNECT WITH US</h3></td></tr><tr><td><div class="socil-icon" style="width:100%; text-align:center;"><a href="#" style="margin-right:70px;"><img style="width:7px;" src="'+websiteUrl+'/public/images/icon/fb-icon.png" alt="pict"></a><a href="#" style="margin-right:70px;"><img style="width:15px;" src="'+websiteUrl+'/public/images/icon/photographi-icon.png" alt="pict"></a><a href="#" style="margin-right:70px;"><img style="width:15px;" src="'+websiteUrl+'/public/images/icon/tw-icon.png" alt="pict"></a><a href="#" style="margin-right:70px;"><img style="width:15px;" src="'+websiteUrl+'/public/images/icon/pinter.png" alt="pict"></a><a href="#"><img style="width:15px;" src="'+websiteUrl+'/public/images/icon/you-tube.png" alt="pict"></a></div></td></tr><tr><td><p style="text-align:center; font-size:12px; line-height:30px;">You received this email because you signed up for Motorcycle services.<br> Privacy Policy | Contact Us<br>Motorcycle, XYZ  </p></td></tr></tbody></table></td></tr></tbody></table></body></html>',
    
    'facebookAuth' : {
        'clientID'        : '1624372031202122', // your App ID
        'clientSecret'    : 'db55897a815b7d440644efe084d542f9', // your App Secret
        'callbackURL'     : websiteUrl+'/auth/facebook/callback',
        'profileURL'      : 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email'
    }
};