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
var db = mongojs("deskdb", ["usermodels"]);
var mongoose = require('mongoose');

var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/deskdb';

mongoose.connect(connectionString);

var UserSchema = new mongoose.Schema({
    username: String,
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

passport.use(new LocalStrategy(
function(username, password, done)
{
    UserModel.findOne({username: username, password: password}, function(err, user)
    {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        return done(null, user);
    })
}));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    UserModel.findById(user._id, function(err, user) {
        done(err, user);
      });
});

var auth = function(req, res, next)
{
    if (!req.isAuthenticated())
        res.send(401);
    else
        next();
};

app.post("/login", passport.authenticate('local'), function(req, res){
    res.send(req.user);
});

app.get('/loggedin', function(req, res)
{
    res.send(req.isAuthenticated() ? req.user : '0');
});
    
app.post('/logout', function(req, res)
{
    req.logOut();
    res.send(200);
});     

app.post('/register', function (req, res) {
    var newUser = req.body;
    UserModel.findOne({ username: newUser.username }, function (err, docs) {
        if (err || docs) {
            res.status(401).send('Username ' + newUser.username + ' is already taken. Try something else');
        } else {
            insertNewUser(req, res, newUser);
        }
    });
});

//Helper function to put a new user in a DB
function insertNewUser(req, res, newUser) {
    newUser.roles = ['employee'];
    conn.collection('usermodels').insert(newUser, function (err, docs) {
        if (err) {
            res.status(401).send('Ther was an error with your resigtration. Try that again.');
        } else {
            passport.authenticate('local')(req, res, function () {
                res.send(req.user);
            })
        }
    });
}

app.get("/rest/user", auth, function(req, res)
{
    db.usermodels.find( {roles : { $ne: "admin" } }, { username : 1, desk : 1 } ).sort( {username : 1}, 
    function (err, users) {
        res.json(users);
    });
});

app.delete("/rest/user/:id", auth, function(req, res){
    UserModel.findById(req.params.id, function(err, user){
        user.remove(function(err, count){
            UserModel.find(function(err, users){
                res.json(users);
            });
        });
    });
});

app.put("/rest/user/:id", auth, function(req, res){

    UserModel.findById(req.params.id, function(err, user){
        user.update(req.body, function(err, count){

            res.json(req.body);
        });
    });
});



app.post("/rest/user", auth, function(req, res){
    UserModel.findOne({username: req.body.username}, function(err, user) {
        if(user == null)
        {
            user = new UserModel(req.body);
            user.save(function(err, user){
                UserModel.find(function(err, users){
                    res.json(users);
                });
            });
        }
        else
        {
            UserModel.find(function(err, users){
                res.json(users);
            });
        }
    });
});


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
var port = process.env.PORT || 8080;

server.listen(port, ipaddress, function() {
    console.log((new Date()) + ' Server is listening at:' + port);
});