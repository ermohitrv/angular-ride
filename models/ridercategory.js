var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ridercategorySchema = Schema({
    categoryName : {type: String}
});
module.exports = mongoose.model('ridercategory', ridercategorySchema);
