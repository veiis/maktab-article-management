const express = require('express');
const mongoose = require('mongoose');
const cookieParser  = require('cookie-parser');
const expressSession = require('express-session');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const path = require('path');
const passport = require('passport');
const bodyParser = require('body-parser');
const database = require('./tools/database');
const ARTICLE = require('./models/article');
const USER = require('./models/user');

// Connect to Database
mongoose.connect(database.url, database.options);
const DB = mongoose.connection;

DB.once('open', () => {
    console.log('Database Connected Successfuly! ;)');
});

DB.on('error', (err) => {
    console.log(err);
});

// Initialize Express
const app = express();

// Set Sessions and Flash Connect
app.use(cookieParser());
app.use(expressSession({ secret: 'veisiwakeup', resave: true, saveUninitialized: true }));
app.use(flash());
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Set Body parser
app.use(bodyParser.urlencoded( { extended: false }));
app.use(bodyParser.json());

// Set Express Validator [v5]
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        let namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;
        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// Passport Config
passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    USER.findById(id, (err, user) => {
        done(err, user);
    });
});

require('./tools/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Set Global router to set Logged user in everywhere
app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Set Static Directory
app.use(express.static(path.join(__dirname, 'public')));

// Set View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set Index Router
app.get('/', (req, res) => {
    ARTICLE.find({}, (err, articles) => {
        articles = Object.assign([], articles).reverse();
        res.render('index', { articles });
    });
});

// Set API Router
let API_ROUTER = require('./routes/api');
app.use('/api', API_ROUTER);

// Handle 404
app.use(function (req, res, next) {
    res.status(404);
    res.type('txt').send('404 Not found');
});


app.listen(3000, () => { console.log('Server is Runing on 3000') });