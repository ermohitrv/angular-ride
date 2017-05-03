var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var riderexperienceSchema = Schema({
    experienceName : {type: String}
});
module.exports = mongoose.model('riderexperience', riderexperienceSchema);
