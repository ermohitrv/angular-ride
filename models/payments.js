var mongoose         = require('mongoose');


var paymentSchema = mongoose.Schema({
        username                : {type: String, default: ''},
        user_email              : {type: String, default: ''},
        payment_status          : {type: String, default: ''},
        paypalToken             : {type: String, default: ''},
        paypalPayerid           : {type: String, default: ''},
        paypalPaymentTime       : {type: Date, default: Date.now(),required: false},
});

// create the model for rproutes and expose it to our app
module.exports = mongoose.model('payments', paymentSchema);
