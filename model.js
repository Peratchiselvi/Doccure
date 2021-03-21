var mongoose = require('mongoose');

var imageSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    dob: String,
    mail: String,
    number: String,
    mail: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    country: String,
	img:
	{
        data: Buffer
	}
});

//Image is a model which has a schema imageSchema

module.exports = new mongoose.model('Image', imageSchema);
