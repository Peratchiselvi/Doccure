var mongoose = require('mongoose');

var doctorSchema = new mongoose.Schema({
    username: String,
    mail: String,
    fname: String,
    lname: String,
    number: String,
    dob: String,
    fees: String,
    gender: String,
    biography: String,
    clinicname: String,
    clinicaddress: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    country: String,
    postalcode: String,
    rating_option: String,
    custom_rating_count: String,
    services: String,
    specialist: String,
    degree: Array,
    college: Array,
    cYear: Array,
    hospitalName: Array,
    fromYear: Array,
    toYear: Array,
    designation: Array,
    awards: Array,
    awardYear: Array,
    starttime: Array,
    membership: Array,
    registration: Array,
    registeredYear: Array,
	img:
	{
		data: Buffer
	}
});

//Image is a model which has a schema imageSchema

module.exports = new mongoose.model('Doctor', doctorSchema);
