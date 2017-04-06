var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var routetoolsSchema = Schema({
    email                  :{type: String, default: ''},
    numberOfNails          :{type: Number, default: 0},
    numberOfPatches        :{type: Number, default: 0},
    numberOfHelmets        :{type: Number, default: 0},
    numberOfOil            :{type: Number, default: 0},
    numberOfWrench         :{type: Number, default: 0},
    numberOfCar            :{type: Number, default: 0},
    numberOfTowTruck       :{type: Number, default: 0},      
    numberOfPolicecar      :{type: Number, default: 0},    
    numberOfOdometer       :{type: Number, default: 0},
});

module.exports = mongoose.model('Routetools', routetoolsSchema);
