let express = require('express');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let bcrypt = require('bcrypt');
let path = require('path');
let jwt = require('jsonwebtoken')

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const uri = "mongodb+srv://thomasbarrett:foobar@iron-man-august-6l10q.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });

let users = null;
let workouts = null;

// Create Express Server
const app = express();

// Set Express Server Middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('secret', 'pip-pip-cheerio');

// Create HTTP Server
var http = require('http').createServer(app);

function createToken(user, duration) {

    const payload = {
      _id: user._id,
      username: user.username,
      admin: user.admin
    };
  
    return jwt.sign(payload, app.get('secret'), {
        expiresIn: duration
    });
}

// get an instance of the router for api routes
var APIRouter = express.Router();

// route middleware to verify a token
APIRouter.use(function(req, res, next) {
    if (req.cookies.token) {
        jwt.verify(req.cookies.token, app.get('secret'), function(error, decoded) {
            if (error) {
                return res.json({
                    success: false,
                    message: 'failed to authenticate token'
                });
            } else {
                req.user = decoded;
                next();
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'failed to authenticate token'
        });
    }
});

// get an instance of the router for api routes
var StaticRouter = express.Router();

// route middleware to verify a token
StaticRouter.use(function(req, res, next) {
    if (req.cookies.token) {
        jwt.verify(req.cookies.token, app.get('secret'), function(error, decoded) {
            if (error) {
                res.sendFile(path.join(__dirname + '/public/login.html'));
            } else {
                req.user = decoded;
                next();
            }
        });
    } else {
        res.sendFile(path.join(__dirname + '/public/login.html'));
    }
});

app.post('/api/logout', function(req, res) {
    res.cookie('token', '', {
        httpOnly: true,
        expire: 86400
    }).json({
        success: true,
        message: 'logout successful',
    });
});


app.post('/api/authenticate', function(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    
    users.findOne({ username }, (error, user) => {
        if (error) {
            throw error;
        } else if (!user) {
            res.json({ success: false, message: `user not found: ${req.body.username}` });
        } else {
            bcrypt.compare(password, user.hash, (error, equal) => {
                if (error) {
                    throw error;
                } else if (equal) {
                    res.cookie('token', createToken(user, 86400), {
                        httpOnly: true,
                        expire: 86400
                    }).json({
                        success: true,
                        message: 'login successful',
                        user
                    });
                } else {
                    res.json({ success: false, message: 'incorrect password' });
                }
            });  
        }
    });
});

app.post('/api/createaccount', function(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;

    // The username, password, and email fields are required for the creation of a user.
    if (username && password && email) {

        // Before creating a new account, we must ensure that the username does not
        // clash with any other usernames of any other users.
        users.findOne({ username }, (error, result) => {

            // If there is an internal error in searching the database, then we
            // should throw the error to the command line. This will result in HTTP
            // code 500 being returned to user. It is unclear if this is proper behavior
            if (error) {
                throw error;
            } 
            
            // If the database was successfully searched, but a user with the given
            // username was not found, then we should create a user with the given
            // information
            else if (!result) {
    
                bcrypt.hash(password, 10, function(err, hash) {
                    // construct user data information to be inserted into database
                    const user = {
                        username,
                        hash,
                        email, 
                        admin: false,
                    };


                    // insert a new user into the user database and return
                    // a cookie authenticated for the user that was just
                    // created
                    users.insertOne(user, (error, response) => {
                        if (error) {
                            throw error;
                        } else {
                            res.cookie('token', createToken(user, 86400), {
                                httpOnly: true,
                                expire: 86400
                            }).json({
                                success: true,
                                message: 'account created',
                                user
                            });
                        }
                    });
                });
            } else {
                res.json({
                    success: false,
                    message: 'username not available'
                });
            }
        });
    } else {
        res.json({
            success: false,
            message: 'invalid username, password, or email'
        });
    }
});

/*==-----------------------------------------------------------------------==*\
| API ROUTES - PROTECTED
\*==-----------------------------------------------------------------------==*/

app.use('/api', APIRouter);

app.get('/api/whoami', (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

app.get('/api/everyone', (req, res) => {
    users.find({}).toArray().then(everyone => {
        res.json({
            success: true,
            everyone
        });
    }).catch(error => {
        throw error;
    })
});

app.get('/api/workouts', (req, res) => {

    workouts.find({user: req.user._id}).toArray().then(workouts => {
        res.json({
            success: true,
            workouts
        });
    }).catch(error => {
        res.json({
            success: false,
            message: error.message
        });
    });

});


app.delete('/api/workouts/:_id', (req, res) => {
    console.log(req.params._id);

    workouts.deleteOne({
        _id: new ObjectID(req.params._id)
    }).then(workouts => {
        res.json({
            success: true,
        });
    }).catch(error => {
        res.json({
            success: false,
            message: error.message
        });
    });

});


app.get('/api/stats', (req, res) => {

    async function readStats() {
        let workoutStats = await workouts.find({user: req.user._id}).toArray();
        
        return {
            swim: workoutStats.reduce((acc, curr) => acc + curr.swim, 0),
            bike: workoutStats.reduce((acc, curr) => acc + curr.bike, 0),
            run: workoutStats.reduce((acc, curr) => acc + curr.run, 0),
        }
    }

    readStats().then(stats => {
        res.json({
            success: true,
            stats
        });
    }).catch(error => {
        res.json({
            success: false,
            message: error.message
        });
    });

});

app.get('/api/stats/:id', (req, res) => {

    async function readStats() {
        let workoutStats = await workouts.find({user: req.params.id}).toArray();
        
        return {
            swim: workoutStats.reduce((acc, curr) => acc + curr.swim, 0),
            bike: workoutStats.reduce((acc, curr) => acc + curr.bike, 0),
            run: workoutStats.reduce((acc, curr) => acc + curr.run, 0),
        }
    }

    readStats().then(stats => {
        res.json({
            success: true,
            stats
        });
    }).catch(error => {
        res.json({
            success: false,
            message: error.message
        });
    });

});

app.post('/api/workouts', (req, res) => {
    workouts.insertOne({
        user: req.user._id,
        ...req.body
    }).then(result => {
        res.json({
            success: true
        });
    }).catch(error => {
        res.json({
            success: false,
            message: error.message
        });
    });
});

app.use('/styles', express.static(path.join(__dirname, 'public/styles')))
app.use('/components', express.static(path.join(__dirname, 'public/components')))

app.use(StaticRouter);
app.use(express.static(path.join(__dirname, 'public')))

// Connect to MongoDB Database
client.connect(error => {
    if (error) {
        console.log(error);
    } else {
        users = client.db("authentication").collection("users");
        workouts = client.db("stats").collection("workouts");
        http.listen(3001, () => console.log('Iron-Man-August Server Initiated'));
    }
});
  