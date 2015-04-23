var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer'); 
var passport      = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser  = require('cookie-parser');
var session       = require('express-session');
var server = require('http').createServer(app);

// mongoose
var mongojs = require('mongojs');
var ObjectId = mongojs.ObjectId;

var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/deskdb';

var db = mongojs(connectionString, ["usermodels"]);
var mongoose = require('mongoose');
mongoose.connect(connectionString);

// User Schema
var UserSchema = new mongoose.Schema({
    username: String,
    usernameLowercase: String,
    password: String,
    roles: [String],
    desk: String
});

var UserModel = mongoose.model('UserModel', UserSchema);

var conn = mongoose.connection;

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data
app.use(cookieParser());
app.use(session({ secret: '<mysercret>', saveUninitialized: true, resave: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

// Declare local strat for PassportJS
passport.use(new LocalStrategy(
function(username, password, done)
{
    UserModel.findOne({username: username, password: password}, function (err, user)
    {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        return done(null, user);
    })
}));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    UserModel.findById(user._id, function(err, user) {
        done(err, user);
      });
});

// function to check authenticaion on pages
var auth = function(req, res, next)
{
    if (!req.isAuthenticated())
        res.send(401);
    else
        next();
};

//POST log in a user
app.post("/login", passport.authenticate('local'), function(req, res){
    res.send(req.user);
});

//GET logged in user
app.get('/loggedin', function (req, res)
{
    res.send(req.isAuthenticated() ? req.user : '0');
});

// POST log out a user
app.post('/logout', function (req, res)
{
    req.logOut();
    res.send(200);
});     

// POST register a user
app.post('/register', function (req, res) {
    var newUser = req.body;
    UserModel.findOne({ usernameLowercase: newUser.usernameLowercase }, function (err, docs) {
        if (err || docs) {
            res.status(401).send('username is already taken. please try again');
        } else {
            insertNewUser(req, res, newUser);
        }
    });
});

// Helper function: inserts a new user into DB
function insertNewUser(req, res, newUser) {
    newUser.roles = ['employee'];
    conn.collection('usermodels').insert(newUser, function (err, docs) {
        if (err) {
            res.status(401).send('There was an error with your resigtration. Try that again.');
        } else {
            passport.authenticate('local')(req, res, function () {
                res.send(req.user);
            });
        }
    });
}

// GET return all users with an EMPLOYEE role
app.get("/rest/user", auth, function(req, res)
{
    db.usermodels.find( {roles : { $ne: "admin" } }, { username : 1, desk : 1 } ).sort( {username : 1}, 
    function (err, users) {
        res.json(users);
    });
});

// PUT update a user
app.put("/rest/user/:id", auth, function(req, res){

    db.runCommand(
    {
        findAndModify: "usermodels",
        query: { _id: ObjectId(req.params.id) },
        update: { 
            username: req.body.username, 
            usernameLowercase: req.body.usernameLowercase,
            password: req.body.password,
            password2: req.body.password2,
            roles: req.body.roles,
            desk: req.body.desk 
        },
        new: true
    }, function (err, response) {
        res.json(response.value);
    });
});

// GET returns a count of ALL desk types
app.get("/rest/desk", auth, function(req, res) {

    db.usermodels.aggregate(
        { $match : { roles : "employee" } }, 
        { $group : { _id: "$desk", count: { $sum : 1 } } },
        function (err, desks) {
            res.json(desks);
        });
});

// listen
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

server.listen(port, ipaddress, function() {
    console.log((new Date()) + ' Server is listening at:' + port);
});