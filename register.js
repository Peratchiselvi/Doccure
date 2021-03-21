const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const urlEncoded = bodyParser.urlencoded({extended: false})
const session = require('express-session');
const timing = require('node-datetime');
const crypto = require('crypto');
const url1 = require('url');
const mongoclient = require('mongodb').MongoClient;
const url = "mongodb+srv://Peratchi:Roselin2019@cluster0.mpk3y.mongodb.net/<database>?retryWrites=true&w=majority";
const path = require('path');
var app = express();
var mongoose = require('mongoose');
const flash = require('connect-flash');
var fs = require('fs');
var nodemailer = require('nodemailer');
require('dotenv/config');
app.use(express.static("css"));
app.use(session({
    secret: 'anony', 
    resave: true,   
    saveUninitialized: true
}));
app.use(flash());
app.use(cookieParser());
app.get('/register', function(req, res){
    res.sendFile(path.resolve("css/register.html"));
});
app.post('/patregister', urlEncoded, function(req, res){
    const p = req.body.patpassword;
    const pass = crypto.createHmac('sha256', p).digest('hex');
    console.log(req.cookies);
    const token = req.body.patmail;
    res.cookie('profile', token, {maxAge : 9000000000, httpOnly: true});
    var response = {name: req.body.patname, number: req.body.patnumber, mail: req.body.patmail, password: pass};
    console.log(response);
    mongoclient.connect(url, { useUnifiedTopology: true }, function(err, db){
        if(err){
            console.log("err");
        }
        const dbc = db.db("docdb");
        dbc.collection("patientregister").insertOne(response, function(err, res){
            if(err) throw err;
            console.log("success");
            db.close();
        });
        res.redirect('/login');
    });
});

app.post('/docregister', urlEncoded, function(req, res){
    const p = req.body.docpassword;
    console.log(p);
    const pass = crypto.createHmac('sha256', p).digest('hex');
    console.log(req.cookies);
    const token = req.body.docmail;
    res.cookie('profile', token, {maxAge : 9000000000, httpOnly: true});
    var response = {name: req.body.docname, number: req.body.docnumber, mail: req.body.docmail, password: pass};
    console.log(response);
    mongoclient.connect(url, { useUnifiedTopology: true }, function(err, db){
        if(err){
            console.log("err");
        }
        const dbc = db.db("docdb");
        dbc.collection("doctorregister").insertOne(response, function(err, res){
            if(err) throw err;
            console.log("success");
            db.close();
        });
    });
});
app.get('/logout',function(req,res){
    res.clearCookie('profile');
    res.redirect('/index.html');
})
app.get('/login', function(req, res){
    console.log(req.cookies['profile']);
    const token = req.cookies['profile'];
    if(token){
        mongoclient.connect(url, { useUnifiedTopology: true }, function(err, db){
            if(err){
                console.log("err");
            }
            const dbc = db.db("docdb");
            const query = {mail: token};
            dbc.collection("patientregister").findOne(query,function(err, result){
                if(err) throw err;
                if(result){
                    global.pattoken = token;
                    res.redirect('/patientProfile');
                }
                if(!result){
                    dbc.collection("doctorregister").find(query).toArray(function(err, result){
                        if(err) throw err;
                        if(result){
                            global.doctoken = token;
                            res.redirect('/doctorProfile');
                        }
                    })
                }
            })
        })
    }
    else{
        res.sendFile(path.resolve("css/login.html"));
    }
});
app.post('/patlogin', urlEncoded, function(req, res){
    console.log("pat");
    const p = req.body.patpassword;
    const pass = crypto.createHmac('sha256', p).digest('hex');
    console.log(req.cookies);
    global.token = req.body.patmail;
    res.cookie('profile', token, {maxAge : 9000000000, httpOnly: true});
    mongoclient.connect(url, { useUnifiedTopology: true }, function(err, db){
        if(err){
            console.log("err");
        }
        const dbc = db.db("docdb");
        const query = {mail: req.body.patmail, password: pass};
        dbc.collection("patientregister").find(query).toArray(function(err, result){
            if(err) throw err;
            console.log(result.length);
            if(result.length == 1){
                global.pattoken = req.body.patmail;
                res.redirect('patient');
            }
            else{
                dbc.collection("doctorregister").find(query).toArray(function(err, result){
                    if(err) throw err;
                    console.log(result.length);
                    if(result.length == 1){
                        global.doctoken = req.body.patmail;
                        res.redirect('doctorProfilesettings');
                    }
                })
            }
        });
    });
});
// Connecting to the database 
mongoose.connect(url,
	{ useNewUrlParser: true, useUnifiedTopology: true }, err => {
		console.log('connected')
    });
    var imgModel = require('./model');
    var doctorModel = require('./doctorModel');
// Retriving the image
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Set EJS as templating engine 
app.set("view engine", "ejs");
var fs = require('fs');
var multer = require('multer');
const { query } = require('express');
const { resolve } = require('path');

var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads')
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now())
	}
});

var upload = multer({ storage: storage });

app.get('/patientProfile', (req, res) => {
	imgModel.find({}, (err, items) => {
		if (err) {
			console.log(err);
		}
		else {            
            mongoclient.connect(url, { useUnifiedTopology: true }, function(err, db){
                if(err){
                    console.log("err");
                }
                if(pattoken){
                const dbc = db.db("profile");
                const patientMail = {mail: pattoken}
                dbc.collection("images").findOne(patientMail,function(err, result){
                    if(err) throw err;
                    if(result){
                        res.render('patientProfile', { user: result });
                        console.log(result);
                    }
                    else{
                        res.render('patientProfile', {user: false});                        
                    }
                    console.log("success");
                    db.close();
                });}
            });
		}
	});
});
// Uploading the image
app.post('/patientProfile', upload.single('image'), (req, res) => {
    console.log(req.body);
    if(req.file){
	obj = {fname: req.body.fname,lname: req.body.lname, dob: req.body.dob, bgroup: req.body.bgroup, mail: req.body.mail, number: req.body.number, address: req.body.address, city: req.body.city,
		state: req.body.state, zip: req.body.zipcode, country: req.body.country,
		img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename))
		}
    }}
    else{
        obj = {fname: req.body.fname,lname: req.body.lname, dob: req.body.dob, bgroup: req.body.bgroup, mail: req.body.mail, number: req.body.number, address: req.body.address, city: req.body.city,
            state: req.body.state, zip: req.body.zipcode, country: req.body.country}
    }
    var query = {mail: req.body.mail};/*
    imgModel.replaceOne(query, function(err, data){
        if(err){
            console.log(err);
        }
    })*/
	imgModel.update(query, obj, {upsert: true}, (err, item) => {
		if (err) {
			console.log(err);
		}
		else {
			// item.save();
			res.redirect('/');
		}
	});
});
app.get('/doctorProfilesettings', function(req, res) {
	doctorModel.find({}, (err, items) => {
        console.log(doctoken);
		if (err) {
            throw err;
		}
		else {    
            console.log(req.body.endtime);       
            mongoclient.connect(url, { useUnifiedTopology: true }, function(err, db){
                if(err){
                    console.log("err");
                }
                else{
                if(doctoken){
                    const dbc = db.db("<database>");
                    const doctorMail = {mail: doctoken};
                    dbc.collection("doctors").findOne(doctorMail,function(err, result){
                    if(err) throw err;
                    console.log(result);
                    if(result){
                        res.render('doctorProfilesettings', { user: result });
                    }
                    else{
                        console.log("else");
                        res.render('doctorProfilesettings',{user: false});                        
                    }
                    console.log("success");
                    db.close();
                });}}
            });
		}
	});
});
// Uploading the image
app.post('/doctorProfilesettings', upload.single('doctorProfile'), (req, res) => {
    console.log(req.body.dob);
    console.log(req.body.starttime);
    console.log(req.body.starttime1);
    if(typeof(req.body.degree) == "object"){
        var degreeArray = [];
        var collegeArray = [];
        var cYearArray = [];
        var deg = req.body.degree;
        deg.forEach(function(el){ 
            console.log(el);
            degreeArray.push(el); 
        })  
        if(req.body.degreenew1 != ''){  degreeArray.push(req.body.degreenew1); }
        if(req.body.degreenew2 != ''){ degreeArray.push(req.body.degreenew2); }
        req.body.college.forEach(function(el){ 
            console.log(el);
            collegeArray.push(el); 
        })  
        if(req.body.college1 != ''){ collegeArray.push(req.body.college1); }
        if(req.body.college2 != ''){ collegeArray.push(req.body.college2); }
        req.body.cYear.forEach(function(el){ 
            console.log(el);
            cYearArray.push(el); 
        })  
        if(req.body.cYear1 != ''){  cYearArray.push(req.body.cYear1); }
        if(req.body.cYear2 != ''){ cYearArray.push(req.body.cYear2); }
    }
    else{
        var degreeArray = [req.body.degree,req.body.degreenew1,req.body.degreenew2];
        var collegeArray = [req.body.college,req.body.college1,req.body.college2];
        var cYearArray = [req.body.cYear,req.body.cYear1,req.body.cYear2];
        console.log("first time in array");
    }
    if(typeof(req.body.hospitalName) == "object"){
        var hospitalArray = [];
        var fromArray = [];
        var toArray = [];
        var desArray = [];
        req.body.hospitalName.forEach(function(el){ 
            hospitalArray.push(el); 
        })  
        if(req.body.hospitalName1 != ''){  hospitalArray.push(req.body.hospitalName1); }
        if(req.body.hospitalName2 != ''){ hospitalArray.push(req.body.hospitalName2); }
        req.body.fromYear.forEach(function(el){
            fromArray.push(el); 
        })  
        if(req.body.fromYear1){  fromArray.push(req.body.fromYear1); }
        if(req.body.fromYear2){ fromArray.push(req.body.fromYear2); }
        req.body.toYear.forEach(function(el){ 
            toArray.push(el); 
        })  
        if(req.body.toYear1){ toArray.push(req.body.toYear1); }
        if(req.body.toYear2){ toArray.push(req.body.toYear2); }
        req.body.designation.forEach(function(el){
            toArray.push(el); 
        })  
        if(req.body.designation1){  desArray.push(req.body.designation1); }
        if(req.body.designation2){ desArray.push(req.body.designation2); }
    }
    else{
        var hospitalArray = [];
        if(req.body.hospitalName != ''){  hospitalArray.push(req.body.hospitalName); }
        if(req.body.hospitalName1 != ''){  hospitalArray.push(req.body.hospitalName1); }
        if(req.body.hospitalName2 != ''){ hospitalArray.push(req.body.hospitalName2); }
        var fromArray = [req.body.fromYear,req.body.fromYear1,req.body.fromYear2];
        var toArray = [req.body.toYear,req.body.toYear1,req.body.toYear2];
        var desArray = [req.body.designation,req.body.designation1,req.body.designation2];
        console.log("first time in array");
    }
    if(typeof(req.body.award) == "object"){
        var awardArray = [];
        var awardyearArray = [];
        var deg = req.body.award;
        deg.forEach(function(el){
            awardArray.push(el); 
        })  
        if(req.body.award1){  awardArray.push(req.body.award1); }
        if(req.body.award2){ awardArray.push(req.body.award2); }
        req.body.awardYear.forEach(function(el){ 
            awardyearArray.push(el); 
        })  
        if(req.body.awardYear1){  awardyearArray.push(req.body.awardYear1); }
        if(req.body.awardYear2){ awardyearArray.push(req.body.awardYear2); }
    }
    else{
        var awardArray = [];
        if(req.body.award != ''){  awardArray.push(req.body.award); }
        if(req.body.award1 != ''){  awardArray.push(req.body.award1); }
        if(req.body.award2 != ''){ awardArray.push(req.body.award2); }
        var awardyearArray = [req.body.awardYear,req.body.awardYear1,req.body.awardYear2];
    }
    var memberArray = [];
    if(typeof(req.body.member) == "object"){
        var deg = req.body.member;
        deg.forEach(function(el){ 
            memberArray.push(el); 
        })  
    }
    else{
        if(req.body.member != ''){  memberArray.push(req.body.member); }
    }
    if(req.body.member1 != ''){  memberArray.push(req.body.member1); }
    if(req.body.member2 != ''){ memberArray.push(req.body.member2); }
    var registrationArray = [];
    if(typeof(req.body.registration) == "object"){
        var registeredyearArray = [];
        var deg = req.body.registration;
        deg.forEach(function(el){ 
            registrationArray.push(el); 
        })  
        if(req.body.registration1){  registrationArray.push(req.body.registration1); }
        if(req.body.registration2){ registrationArray.push(req.body.registration2); }
        req.body.registeredYear.forEach(function(el){ 
            registeredyearArray.push(el); 
        })  
        if(req.body.registeredYear1){  registeredyearArray.push(req.body.registeredYear1); }
        if(req.body.registeredYear2){ registeredyearArray.push(req.body.registeredYear2); }
    }
    else{
        if(req.body.registration){  registrationArray.push(req.body.registration); }
        if(req.body.registration1){  registrationArray.push(req.body.registration1); }
        if(req.body.registration2){ registrationArray.push(req.body.registration2); }
        var registeredyearArray = [req.body.registeredYear,req.body.registeredYear1,req.body.registeredYear2];
        console.log("first time in array");
    }
    if(req.file){
    var obj = {username: req.body.username, mail: req.body.mail, fname: req.body.fname,lname: req.body.lname, number: req.body.number, gender: req.body.gender, dob: req.body.dob, biography: req.body.biography, clinicname: req.body.clinicname, clinicaddress: req.body.clinicaddress, address1: req.body.address1, address2: req.body.address2, city: req.body.city, 
        state: req.body.state, country: req.body.country, postalcode: req.body.postalcode,
        rating_option: req.body.rating_option, custom_rating_count: req.body.custom_rating_count,services: req.body.services,specialist: req.body.specialist,degree: degreeArray, college: collegeArray,cYear: cYearArray,hospitalName: hospitalArray,fromYear: fromArray,toYear: toArray,designation: desArray,
        awards: awardArray,awardYear: awardyearArray,membership: memberArray,registration: registrationArray,registeredYear: registeredyearArray,
		
		img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename))
		}
    }
}
    else{
        var obj = {username: req.body.username, mail: req.body.mail, fname: req.body.fname,lname: req.body.lname, number: req.body.number, gender: req.body.gender, dob: req.body.dob, biography: req.body.biography, clinicname: req.body.clinicname, clinicaddress: req.body.clinicaddress, address1: req.body.address1, address2: req.body.address2, city: req.body.city, 
            state: req.body.state, country: req.body.country, postalcode: req.body.postalcode,
            rating_option: req.body.rating_option, custom_rating_count: req.body.custom_rating_count,services: req.body.services,specialist: req.body.specialist,degree: degreeArray, college: collegeArray,cYear: cYearArray, hospitalName: hospitalArray,fromYear: fromArray,toYear: toArray,designation: desArray,
            awards: awardArray,awardYear: awardyearArray,starttime: req.body.starttime,membership: memberArray,registration: registrationArray,registeredYear: registeredyearArray,
    }}
    var query = {mail: req.body.mail};/*
    imgModel.replaceOne(query, function(err, data){
        if(err){
            console.log(err);
        }
    })*/
	doctorModel.updateOne(query, obj, { upsert: true }, (err, item) => {
		if (err) {
			console.log(err);
		}
		else {
            // item.save();
            console.log(obj);
            res.redirect('/');
            console.log("inserterd");
		}
	});
});
app.get('/logout', (req, res) =>{
    res.clearCookie('profile');
    res.redirect('/login');
})
app.get('/search.html', function(req, res){ 
	doctorModel.find({}, (err, items) => {
		if (err) {
			console.log(err);
        }
        else   {      
    mongoclient.connect(url, { useUnifiedTopology: true }, function(err, db){
        if(err){
            console.log("err");
        }
        const dbc = db.db("<database>");
        dbc.collection("doctors").find({}).toArray(function(err, result){
            if(err) throw err;
            if(result){
                console.log(result);
                res.render('search.ejs', { user: result });
            }
            else{
                res.render('search.ejs',{user: false});                        
            }
            console.log("success");
            db.close();
        });
        });}
    });
});
app.use('/booking', function(req,res){ 
    var doctor = url1.parse(req.url, true).query;
    var urlfname = doctor.fname;
    var urllname = doctor.lname;
    var doctorname = {fname: urlfname, lname: urllname};
    req.flash("msg", "Booked Successfully!");
    req.flash("errmsg", "Unavailable");
    mongoclient.connect(url, {useUnifiedTopology: true}, function(err, db){
        if(err) throw err;
        const dbc = db.db("<database>");
        dbc.collection("doctors").findOne(doctorname, function(err, data){
            global.doctorUsername = data.mail;
            if(err) throw err;
            else{
                res.render('booking.ejs', {bookingDetail: data});
            }
        });
});
});
app.use('/patientappointment', function(req, res){
    var appobj = url1.parse(req.url, true).query;
    const date = appobj.day;
    const time = appobj.time;
    var booking = {date: date, time: time};
    mongoclient.connect(url, {useUnifiedTopology: true}, function(err, db){
        if(err) throw err;
        else{
            const dbc = db.db("<database>");
            global.type = "Old Patient";
            console.log("bi");
            console.log(doctorUsername);
            dbc.collection("booking").countDocuments(booking, function(err, result) {
            if(err) throw err;
            if(result <= 6){
                if(doctorUsername){
                    dbc.collection("images").findOne({mail: doctorUsername}, function(err, data){
                        if(data){
                        dbc.collection("doctorsPatient").findOne({patientProfile: data}, function(err, dpdata){
                            if(!dpdata){
                                global.type = "New Patient";
                                dbc.collection("doctorsPatient").insertOne({patientProfile: data, doctor: doctorUsername}, function(err, resultnew) {});
                            }
                        });
                        appbooking = {patientProfile: data, doctor: doctorUsername, bookedtime: booking, typeofPat: type};
                        dbc.collection("booking").insertOne(appbooking, function(err, resultnew) {});
                        res.send(req.flash("msg"));
                        res.render('booking-ack.ejs',{msg: 'Success', doc: doctorUsername, time : booking});
                }
                    })
                }
            }
            else{
                res.send(req.flash("errmsg"));
                res.render('booking-ack.ejs',{msg: 'Failure', doc: doctorUsername});
            }
        });}
    } );
})
app.use('/doctorappointment', function(req, res){
    mongoclient.connect(url, {useUnifiedTopology: true}, function(err, db){
        const dbc = db.db("<database>");
        console.log(docdetail);
        var doctormail = {mail: docdetail};
        var docmail = {doctor: docdetail};
        console.log(docmail);
        dbc.collection("doctors").findOne(doctormail,function(err, resultdoc){
            if(err) throw err;
            dbc.collection("booking").find(docmail).toArray(function(err, result){
                if(err) throw err;
                console.log("booking");
                console.log(resultdoc);
                res.render('doctorappointment.ejs', { docdetail: resultdoc, docapps: result });
            });
        });
    });
});
app.use('/doctor-profile', function(req, res) {
    var doctor = url1.parse(req.url, true).query;
    var urlfname = doctor.fname;
    var urllname = doctor.lname;
    var doctorname = {fname: urlfname, lname: urllname};
    mongoclient.connect(url, {useUnifiedTopology: true}, function(err, db){
        if(err) throw err;
        const dbc = db.db("<database>");
        dbc.collection("doctors").findOne(doctorname,function(err, resultdoc){
            res.render('doctor-profile.ejs', {docdetail : resultdoc});
        });
    });

});
app.use('/my-patients', function(req, res){
    mongoclient.connect(url, {useUnifiedTopology: true}, function(err, db){
        if(err) throw err;
        const dbc = db.db("<database>");
        const docdet = {mail: docdetail};
        const docpat = {doctor: docdetail};
        dbc.collection("doctors").findOne(docdet,function(err, resultdoc){
            console.log("doc");
            console.log(resultdoc);
        dbc.collection("doctorsPatient").find(docpat).toArray(function(err, docpatient){
            console.log("docp");
                console.log(docpatient);
            res.render('my-patients.ejs', {docPatient : docpatient, doctor : resultdoc});
        });});
});
});
app.use('/doctor-dashboard', function(req, res){
    mongoclient.connect(url, {useUnifiedTopology: true}, function(err, db){
        if(err) throw err;
        const dbc = db.db("<database>");
        const docdet = {mail: docdetail};
        const docpat = {doctor: docdetail};
        const crtdate = String(timing.create().format('dmY'));
        console.log(crtdate);
        const timecheck = {'bookedtime.date' : crtdate};
        console.log(timecheck);
        dbc.collection("doctors").findOne(docdet,function(err1, resultdoc){
            dbc.collection("doctorsPatient").countDocuments(docpat, function(err2, docpatientcount){
                    console.log(docpatientcount);
                    dbc.collection("booking").find(docpat).toArray(function(err3, booking){
                        dbc.collection("booking").find(timecheck).toArray(function(err4, todaybooking){
                            console.log(todaybooking);
                            res.render('doctor-dashboard.ejs', {docPatient : docpatientcount, doctor : resultdoc, upcomingbooking: booking, todaybooking: todaybooking});
                        });
                    });

            });
        });
    });
});
app.get('/forgot-password.html', function(req, res){
    res.sendFile(path.resolve('forgot-password.html'));
});
app.post('/forgot-password', urlEncoded, function(req, res){
    var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {user: "selvikumar901@gmail.com", pass: "peratchi2002"}
    });
    var mail = req.body.mail;
    const maildocdetails = {from: "selvikumar901@gmail.com", to: mail, subject: "Reset Password", html: "<a href='reset?mail='" + mail + ">Click Here</a>"}
    const mailindb = {mail: mail};
    mongoclient.connect(url, {useUnifiedTopology: true}, function(err, db){
        const dbc = db.db("docdb");
        dbc.collection("patientregister").findOne(mailindb, function(err1, result){
            console.log(result);
            if(!result){
                dbc.collection("doctorregister").findOne(mailindb, function(err1, result1){
                    if(result1){
                            transporter.sendMail(maildocdetails, function(err3, result2){
                            if(err3) throw err3;
                            console.log("docmail");
                        })
                    }
                    else{
                        console.log(mail);
                        console.log("invalid mail");
                    }
                })
            }
            if(result){
                transporter.sendMail(maildocdetails, function(err4, result2){
                    if(err4) throw err4;                    
                    console.log("docmail");
                })
            }
        })
    })
})
app.use('/reset', function(req, res){
    global.resetmail = url.parse(req).query.mail;    
    res.sendFile(path.resolve('css/reset-password.html'));
})
app.post('/reset-password', function(req, res){
    const newpass = crypto.createHmac('sha256', req.body.newpass).digest('hex');
    mongoclient.connect(url, urlEncoded, function(err, db){
        const dbc = db.db("docdb");
        const passindb = {$set: {password : newpass}};
        const mailinreset = {mail: resetmail};        
        dbc.collection("patientregister").findOne(mailinreset, function(err1, result){
            console.log(result);
            if(!result){
                dbc.collection("doctorregister").findOne(mailinreset, function(err1, result1){
                    if(result1){
                        dbc.collection("doctorregister").updateOne(mailinreset, passindb, function(err4, result2){
                            if(err4) throw err4;   
                            console.log("docmail");
                        })
                    }
                    else{
                        console.log(mail);
                        console.log("invalid mail");
                    }
                })
            }
            if(result){
                dbc.collection("patientregister").updateOne(mailinreset, passindb, function(err4, result2){
                    if(err4) throw err4;                    
                    console.log("patmail");
                })
            }
        })
    })
});
app.get('/change-password.html', function(req, res){
    res.sendFile(path.resolve('css/change-password.html'));
})
app.post('/change-password', function(req, res){
    const oldpass = crypto.createHmac('sha256', req.body.oldpass).digest('hex');
    const newpass = crypto.createHmac('sha256', req.body.newpass).digest('hex');
    mongoclient.connect(url, urlEncoded, function(err, db){
        const dbc = db.db("docdb");
        const passindb = {$set: {password : newpass}};
        const passinchange = {password: oldpass};        
        dbc.collection("patientregister").findOne(passinchange, function(err1, result){
            console.log(result);
            if(!result){
                dbc.collection("doctorregister").findOne(passinchange, function(err2, result1){
                    if(result1){
                        dbc.collection("doctorregister").updateOne(passinchange, passindb, function(err4, result2){
                            if(err4) throw err4;   
                            console.log("docmail");
                        })
                    }
                    else{
                        console.log(mail);
                        console.log("invalid mail");
                    }
                })
            }
            if(result){
                dbc.collection("patientregister").updateOne(passinchange, passindb, function(err4, result2){
                    if(err4) throw err4;                    
                    console.log("patmail");
                })
            }
        })
    })

})
app.get('/index.html', function(req, res){
    res.sendFile(path.resolve('index.html'));
});
app.post('/searchbar', urlEncoded, function(req, res){
    const searchloc = req.body.searchloc;
    const searchval = req.body.search;
    mongoclient.connect(url, urlEncoded, function(err, db){
        const dbc = db.db("docdb");
        dbc.collection("doctorregister").find({$or: [{name : new RegExp(searchval, 'i')}, {hospitalName: new RegExp(searchval, 'i')}, {clinicname : new RegExp(searchval, 'i')},
        {specialist: new RegExp(searchval, 'i')}, {state: new RegExp(searchloc, 'i')}, {country: new RegExp(searchloc, 'i')}, {city: new RegExp(searchloc, 'i')}]}).toArray(function(err, result1){
            if(err) throw err;
            if(result1){
                console.log(result1);
                res.render('search.ejs', { user: result1 });
            }
            else{
                res.render('search.ejs',{user: false});                        
            }
            console.log("success");
            db.close();

        })
    })
});
app.listen(8080);